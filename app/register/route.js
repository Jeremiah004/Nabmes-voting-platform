import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const rawMatric = typeof body.matricNumber === "string" ? body.matricNumber : "";
  const rawCode = typeof body.registrationCode === "string" ? body.registrationCode : "";
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword =
    typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  const matricNumber = rawMatric.trim().toUpperCase();
  const registrationCode = rawCode.trim().toUpperCase();

  if (!matricNumber) {
    return NextResponse.json({ error: "Enter your matric number." }, { status: 400 });
  }
  if (!registrationCode) {
    return NextResponse.json(
      { error: "Enter the registration code your course rep sent you." },
      { status: 400 }
    );
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

  const { data: voter, error: lookupError } = await supabase
    .from("eligible_voters")
    .select("matric_number, registered, department, level, registration_code")
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
          "This matric number is already registered. If this wasn't you, contact the SRC immediately.",
      },
      { status: 409 }
    );
  }

  const expectedCode = (voter.registration_code || "").trim().toUpperCase();
  if (!expectedCode || registrationCode !== expectedCode) {
    return NextResponse.json(
      {
        error:
          "That code doesn't match our records for this matric number. Check with your course rep.",
      },
      { status: 401 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const { error: updateError } = await supabase
    .from("eligible_voters")
    .update({
      password_hash: passwordHash,
      registered: true,
      registered_at: new Date().toISOString(),
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
