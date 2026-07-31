import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawMatric = searchParams.get("matricNumber") || "";
  const matricNumber = rawMatric.trim().toUpperCase();

  if (!matricNumber) {
    return NextResponse.json({ error: "Enter your matric number." }, { status: 400 });
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

  // Only select what we're willing to hand back to an unauthenticated
  // client. In particular: never select `registered` here — this route
  // must not become a way to check whether a matric number has already
  // registered. That check stays inside /api/register.
  const { data: voter, error } = await supabase
    .from("eligible_voters")
    .select("full_name, department, level")
    .eq("matric_number", matricNumber)
    .maybeSingle();

  if (error) {
    console.error(error);
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

  return NextResponse.json({
    fullName: voter.full_name,
    department: voter.department,
    level: voter.level,
  });
}
