import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlayerSummary, getPlayerClubs } from "@/app/actions/team";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PlayerYardagesEditor from "@/components/admin/PlayerYardagesEditor";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ season?: string }>;
};

export default async function PlayerDetailPage({
  params,
  searchParams,
}: Props) {
  const [{ userId }, { season: seasonParam }] = await Promise.all([
    params,
    searchParams,
  ]);
  const id = Number(userId);

  // 'career' → null (all-time), a numeric string → that season id, missing → undefined (current)
  const seasonId =
    seasonParam === "career"
      ? null
      : seasonParam
        ? Number(seasonParam)
        : undefined;

  const [data, clubs] = await Promise.all([
    getPlayerSummary(id, seasonId),
    getPlayerClubs(id),
  ]);
  if (!data) notFound();

  const { user, summary, playerRounds, selectedSeason, playerSeasons } = data;

  const fwyPct =
    summary && summary.fairwayOpps > 0
      ? Math.round((summary.fairwaysHit / summary.fairwayOpps) * 100)
      : null;
  const girPct =
    summary && summary.totalHoles > 0
      ? Math.round((summary.girHit / summary.totalHoles) * 100)
      : null;

  const isCareer = seasonId === null;
  const baseUrl = `/admin/team/${userId}`;

  return (
    <div className="space-y-4">
      <Link href="/admin/team" className="text-sm text-zinc-500">
        ← Back to Team
      </Link>

      <div>
        <h1 className="text-xl font-bold">{user.name}</h1>
        <p className="text-xs text-muted-foreground">
          @{user.username}
          {user.grade ? ` · Grade ${user.grade}` : ""}
        </p>
      </div>

      {/* Season selector — only shown when there is season data to navigate */}
      {playerSeasons.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {playerSeasons.map((s) => {
            const active = !isCareer && selectedSeason?.id === s.id;
            return (
              <Link
                key={s.id}
                href={`${baseUrl}?season=${s.id}`}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {s.name}
              </Link>
            );
          })}
          {playerSeasons.length > 1 && (
            <Link
              href={`${baseUrl}?season=career`}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
                isCareer
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              Career
            </Link>
          )}
        </div>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            {isCareer
              ? "Career Stats"
              : selectedSeason
                ? `${selectedSeason.name} Stats`
                : "Stats"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!summary || summary.roundsPlayed === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              No rounds logged{isCareer ? " yet." : " this season."}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-xl font-bold tabular-nums">
                    {summary.roundsPlayed}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase">
                    Rounds
                  </div>
                </div>
                <div>
                  <div className="text-xl font-bold tabular-nums">
                    {summary.avgScore != null
                      ? summary.avgScore.toFixed(2)
                      : "—"}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase">
                    Avg / Hole
                  </div>
                </div>
                <div>
                  <div className="text-xl font-bold tabular-nums">
                    {summary.avgPutts != null
                      ? summary.avgPutts.toFixed(2)
                      : "—"}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase">
                    Avg Putts
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                <Badge variant="secondary">🦅 {summary.eagles} Eagles</Badge>
                <Badge variant="secondary">🐦 {summary.birdies} Birdies</Badge>
                <Badge variant="secondary">{summary.pars} Pars</Badge>
                {fwyPct !== null && (
                  <Badge variant="outline">Fwy {fwyPct}%</Badge>
                )}
                {girPct !== null && (
                  <Badge variant="outline">GIR {girPct}%</Badge>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <PlayerYardagesEditor clubs={clubs} userId={id} />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            {isCareer
              ? "All Rounds"
              : selectedSeason
                ? `${selectedSeason.name} Rounds`
                : "Rounds"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {playerRounds.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              No rounds logged{isCareer ? " yet." : " this season."}
            </p>
          ) : (
            <ul className="divide-y">
              {playerRounds.map((r) => (
                <li
                  key={r.id}
                  className="py-2 flex items-center justify-between"
                >
                  <Link href={`/rounds/${r.id}`} className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">
                      {r.courseName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.date).toLocaleDateString()} · {r.holesPlayed}
                      {r.roundSegment ? ` (${r.roundSegment} 9)` : ""} holes
                      {r.teeColor ? ` · ${r.teeColor}` : ""}
                    </p>
                  </Link>
                  <span className="text-lg font-bold tabular-nums shrink-0">
                    {r.totalScore ?? "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
