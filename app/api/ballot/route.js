import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";
import { verifySessionToken } from "../../../lib/session";

function groupByPosition(rows) {
  const byPosition = new Map();
  for (const row of rows) {
    if (!byPosition.has(row.position)) byPosition.set(row.position, []);
    byPosition.get(row.position).push({ id: row.id, name: row.name, photo_url: row.photo_url });
  }
  return Array.from(byPosition.entries()).map(([position, candidates]) => ({ position, candidates }));
}

export async function GET(request) {
  const token = request.cookies.get("voter_session")?.value;
  const matricNumber = verifySessionToken(token);
  if (!matricNumber) {
    return NextResponse.json({ error: "Session expired. Sign in again." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data: voter, error: voterError } = await supabase
    .from("eligible_voters")
    .select("level, has_voted_src, has_voted_cec")
    .eq("matric_number", matricNumber)
    .maybeSingle();

  if (voterError || !voter) {
    return NextResponse.json({ error: "Voter record not found." }, { status: 404 });
  }

  const { data: cecRows, error: cecError } = await supabase
    .from("candidates")
    .select("id, position, name, photo_url")
    .eq("election", "CEC")
    .order("position")
    .order("display_order");

  const { data: srcRows, error: srcError } = await supabase
    .from("candidates")
    .select("id, position, name, photo_url")
    .eq("election", "SRC")
    .eq("level", voter.level)
    .order("position")
    .order("display_order");

  if (cecError || srcError) {
    console.error(cecError || srcError);
    return NextResponse.json({ error: "Couldn't load candidates." }, { status: 500 });
  }

  return NextResponse.json({
    level: voter.level,
    hasVotedSrc: voter.has_voted_src,
    hasVotedCec: voter.has_voted_cec,
    cec: groupByPosition(cecRows || []),
    src: groupByPosition(srcRows || []),
  });
}
