import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";
import { verifySessionToken } from "../../../lib/session";

export async function POST(request) {
  const token = request.cookies.get("voter_session")?.value;
  const matricNumber = verifySessionToken(token);
  if (!matricNumber) {
    return NextResponse.json({ error: "Session expired. Sign in again." }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const election = body.election === "SRC" || body.election === "CEC" ? body.election : null;
  const selections = body.selections;
  if (!election || !selections || typeof selections !== "object") {
    return NextResponse.json({ error: "Invalid vote payload." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const votedField = election === "SRC" ? "has_voted_src" : "has_voted_cec";

  const { data: voter, error: voterError } = await supabase
    .from("eligible_voters")
    .select("level, has_voted_src, has_voted_cec")
    .eq("matric_number", matricNumber)
    .maybeSingle();

  if (voterError || !voter) {
    return NextResponse.json({ error: "Voter record not found." }, { status: 404 });
  }

  if (voter[votedField]) {
    return NextResponse.json({ error: `You've already voted in the ${election} election.` }, { status: 409 });
  }

  let candidateQuery = supabase.from("candidates").select("id, position").eq("election", election);
  if (election === "SRC") {
    candidateQuery = candidateQuery.eq("level", voter.level);
  }
  const { data: validCandidates, error: candError } = await candidateQuery;

  if (candError || !validCandidates) {
    console.error(candError);
    return NextResponse.json({ error: "Couldn't verify candidates." }, { status: 500 });
  }

  const positionsRequired = new Set(validCandidates.map((c) => c.position));
  const validIdsByPosition = new Map();
  for (const c of validCandidates) {
    if (!validIdsByPosition.has(c.position)) validIdsByPosition.set(c.position, new Set());
    validIdsByPosition.get(c.position).add(c.id);
  }

  const selectedPositions = Object.keys(selections);
  if (selectedPositions.length !== positionsRequired.size) {
    return NextResponse.json({ error: "Vote must cover every position on this ballot." }, { status: 400 });
  }

  const rowsToInsert = [];
  for (const position of selectedPositions) {
    const candidateId = selections[position];
    const validIds = validIdsByPosition.get(position);
    if (!validIds || !validIds.has(candidateId)) {
      return NextResponse.json({ error: "One of your selections isn't valid. Refresh and try again." }, { status: 400 });
    }
    rowsToInsert.push({ election, position, candidate_id: candidateId });
  }

  const { error: insertError } = await supabase.from("ballots").insert(rowsToInsert);
  if (insertError) {
    console.error(insertError);
    return NextResponse.json({ error: "Couldn't record your vote. Try again." }, { status: 500 });
  }

  await supabase.from("eligible_voters").update({ [votedField]: true }).eq("matric_number", matricNumber);

  return NextResponse.json({ success: true, election });
}
