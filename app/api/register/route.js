import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";
import { getAppSettings } from "../../../lib/settings";

const MIN_PASSWORD_LENGTH = 8;
const MAX_REGISTRATIONS_PER_IP_PER_WINDOW = 2;
const RATE_LIMIT_WINDOW_MINUTES = 15;

function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

async function isProxyIp(ip) {
  if (!ip || ip === "unknown") return false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,proxy,hosting`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.proxy || data.hosting);
  } catch {
    return false;
  }
}

export async function POST(request) {
  const { registrationOpen } = await getAppSettings();
  if (!registrationOpen) {
    return NextResponse.json(
      { error: "Registration is closed. Contact the SRC if you believe this is a mistake." },
      { status: 403 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const rawMatric = typeof body.matricNumber === "string" ? body.matricNumber : "";
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword =
    typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  const matricNumber = rawMatric.trim().toUpperCase();

  if (!matricNumber) {
    return NextResponse.json({ error: "Enter your matric number." }, { status: 400 });
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` },
      { status: 400 }
    );
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords don't match." }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Registration isn't set up yet. Contact the site admin." },
      { status: 500 }
    );
  }

  const ip = getClientIp(request);

  if (await isProxyIp(ip)) {
    return NextResponse.json(
      {
        error:
          "Registration isn't allowed from a VPN or proxy connection. Please turn it off and try again from your normal network.",
      },
      { status: 403 }
    );
  }

  const windowStart = new Date(
    Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000
  ).toISOString();

  const { count: recentCount, error: rateError } = await supabase
    .from("eligible_voters")
    .select("matric_number", { count: "exact", head: true })
    .eq("registered_ip", ip)
    .gte("registered_at", windowStart);

  if (!rateError && recentCount !== null && recentCount >= MAX_REGISTRATIONS_PER_IP_PER_WINDOW) {
    return NextResponse.json(
      {
        error:
          "Too many registrations from this network in a short time. Wait a few minutes and try again, or contact the SRC if this is a shared campus network.",
      },
      { status: 429 }
    );
  }

  const { data: voter, error: lookupError } = await supabase
    .from("eligible_voters")
    .select("matric_number, registered, department, level")
    .eq("matric_number", matricNumber)
    .maybeSingle();

  if (lookupError) {
    console.error(lookupError);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }

  if (!voter) {
    return NextResponse.json(
      {
        error:
          "That matric number isn't on the eligible voters list. Contact your course rep or the SRC if you think this is a mistake.",
      },
      { status: 404 }
    );
  }

  if (voter.registered) {
    return NextResponse.json(
      {
        error:
          "This matric number is already registered. If this wasn't you, report it to the SRC immediately so it can be investigated before voting opens.",
      },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const { error: updateError } = await supabase
    .from("eligible_voters")
    .update({
      password_hash: passwordHash,
      registered: true,
      registered_at: new Date().toISOString(),
      registered_ip: ip,
    })
    .eq("matric_number", matricNumber);

  if (updateError) {
    console.error(updateError);
    return NextResponse.json(
      { error: "Couldn't complete registration. Try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    matricNumber,
    department: voter.department,
    level: voter.level,
  });
}
