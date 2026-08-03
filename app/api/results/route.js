export const metadata = {
  title: "NABMES UNILORIN — Official Election Results",
};

const ELECTION_DATE = "3 August 2026";

// Hardcoded directly from Nabmes_Results.xlsx — no API call, no Supabase.
// Shaped to match the { races: [...] } format /api/results returns,
// so this can be swapped to a live fetch later with minimal changes.
const RESULTS = {
  races: [
    {
      election: "CEC",
      position: "President",
      level: null,
      totalVotes: 188,
      candidates: [
        { id: "president-olajubu", name: "Olajubu Olasubomi", votes: 105, isWinner: true },
        { id: "president-samuel", name: "Samuel Omoleye", votes: 83, isWinner: false },
      ],
    },
    {
      election: "CEC",
      position: "Vice President",
      level: null,
      totalVotes: 186,
      candidates: [
        { id: "vp-adeniyi", name: "Adeniyi Aishat", votes: 186, isWinner: true },
      ],
    },
    {
      election: "CEC",
      position: "General Secretary",
      level: null,
      totalVotes: 186,
      candidates: [
        { id: "gensec-amawuru", name: "Amawuru Dennis", votes: 96, isWinner: true },
        { id: "gensec-moshood", name: "Moshood Olatunji", votes: 90, isWinner: false },
      ],
    },
    {
      election: "CEC",
      position: "Assistant General Secretary",
      level: null,
      totalVotes: 186,
      candidates: [
        { id: "assocgensec-adeonih", name: "Ade-Onih Oluwatomilola", votes: 186, isWinner: true },
      ],
    },
    {
      election: "CEC",
      position: "Financial Secretary",
      level: null,
      totalVotes: 186,
      candidates: [
        { id: "finsec-madinah", name: "Madinah Dauda", votes: 186, isWinner: true },
      ],
    },
    {
      election: "CEC",
      position: "Public Relations Officer",
      level: null,
      totalVotes: 186,
      candidates: [
        { id: "pro-salaudeen", name: "Salaudeen Abdulkabir", votes: 186, isWinner: true },
      ],
    },
    {
      election: "CEC",
      position: "Assistant Public Relations Officer",
      level: null,
      totalVotes: 186,
      candidates: [
        { id: "assocpro-usman", name: "Usman Khalid", votes: 186, isWinner: true },
      ],
    },
    {
      election: "CEC",
      position: "Welfare Secretary",
      level: null,
      totalVotes: 186,
      candidates: [
        { id: "welfare-abdullahi", name: "Abdullahi Muhammed", votes: 186, isWinner: true },
      ],
    },
    {
      election: "CEC",
      position: "Sports Secretary",
      level: null,
      totalVotes: 186,
      candidates: [
        { id: "sports-fatiu", name: "Fatiu Nurudeen", votes: 186, isWinner: true },
      ],
    },
    {
      election: "CEC",
      position: "Social Secretary",
      level: null,
      totalVotes: 186,
      candidates: [
        { id: "social-adamade", name: "Adamade Paul", votes: 186, isWinner: true },
      ],
    },
    {
      election: "CEC",
      position: "Technical Director",
      level: null,
      totalVotes: 186,
      candidates: [
        { id: "techdir-sylvanus", name: "Sylvanus Dogo", votes: 186, isWinner: true },
      ],
    },
    {
      election: "CEC",
      position: "Librarian",
      level: null,
      totalVotes: 186,
      candidates: [
        { id: "librarian-adekunle", name: "Adekunle Daniel", votes: 113, isWinner: true },
        { id: "librarian-emodel", name: "Emodel Clement", votes: 73, isWinner: false },
      ],
    },
  ],
};

export default function ResultsPage() {
  const { races } = RESULTS;

  return (
    <main className="min-h-screen bg-[#f4f4ee] px-4 py-10">
      <div className="mx-auto max-w-md border-x-4 border-[#0d3b34] px-5 py-8">
        <header className="text-center mb-10">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-black flex items-center justify-center">
            <span className="text-2xl">🍊</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#111]">
            NABMES UNILORIN
          </h1>
          <p className="mt-1 text-sm tracking-widest text-[#0d3b34] font-medium">
            OFFICIAL ELECTION RESULTS
          </p>
          <p className="mt-4 text-gray-600">{ELECTION_DATE}</p>
        </header>

        {["CEC", "SRC"].map((electionType) => {
          const racesForType = races.filter((r) => r.election === electionType);
          if (racesForType.length === 0) return null;

          return (
            <section key={electionType} className="mb-10">
              <h2 className="text-lg font-bold tracking-wide text-[#0d3b34] mb-6">
                {electionType}
              </h2>

              <div className="space-y-7">
                {racesForType.map((race) => (
                  <div key={`${race.position}-${race.level ?? ""}`}>
                    <p className="text-sm text-gray-500 mb-1">
                      {race.position}
                      {race.level ? ` (${race.level}L)` : ""}
                    </p>
                    <div className="space-y-1">
                      {race.candidates.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-baseline justify-between"
                        >
                          <span
                            className={
                              c.isWinner
                                ? "font-semibold text-[#111]"
                                : "text-gray-500"
                            }
                          >
                            {c.name}
                            {c.isWinner && <span className="ml-1.5">✓</span>}
                          </span>
                          <span
                            className={
                              c.isWinner ? "text-[#111]" : "text-gray-500"
                            }
                          >
                            {c.votes}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
