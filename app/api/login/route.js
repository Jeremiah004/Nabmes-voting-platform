import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";
import { createSessionToken } from "../../../lib/session";
import { getAppSettings } from "../../../lib/settings";

export async function POST(request) {
  const { votingOpen } = await getAppSettings();
  if (!votingOpen) {
    return NextResponse.json(
      { error: "Voting hasn't opened yet. Check back once polls are live." },
      { status: 403 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const matricNumber =
    typeof body.matricNumber === "string" ? body.matricNumber.trim().toUpperCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!matricNumber || !password) {
    return NextResponse.json(
      { error: "Enter your matric number and password." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  const { data: voter, error } = await supabase
    .from("eligible_voters")
    .select("matric_number, registered, password_hash, has_voted_src, has_voted_cec")
    .eq("matric_number", matricNumber)
    .maybeSingle();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }

  if (!voter || !voter.registered || !voter.password_hash) {
    return NextResponse.json(
      { error: "Matric number or password is incorrect, or you haven't registered yet." },
      { status: 401 }
    );
  }

  const validPassword = await bcrypt.compare(password, voter.password_hash);
  if (!validPassword) {
    return NextResponse.json(
      { error: "Matric number or password is incorrect." },
      { status: 401 }
    );
  }

  const token = createSessionToken(matricNumber);

  const response = NextResponse.json({
    hasVotedSrc: voter.has_voted_src,
    hasVotedCec: voter.has_voted_cec,
  });
  response.cookies.set("voter_session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60,
    path: "/",
  });
  return response;
}}
