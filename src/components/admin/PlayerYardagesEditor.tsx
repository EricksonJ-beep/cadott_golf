"use client";

import { useState, useTransition } from "react";
import { savePlayerClubEditsByCoach } from "@/app/actions/team";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";

type Distance = {
  id: number;
  swingType: string;
  carryYards: number | null;
  totalYards: number | null;
};

type Club = {
  id: number;
  customName: string | null;
  isHidden: boolean;
  defaultClub: { id: number; name: string; type: string } | null;
  distances: Distance[];
};

const SWING_LABELS: Record<string, string> = {
  full: "Full",
  three_quarter: "3/4",
  half: "1/2",
  quarter: "1/4",
};

const WEDGE_SWINGS = ["quarter", "half", "three_quarter", "full"] as const;
const ALL_SWINGS = ["full", "three_quarter", "half", "quarter"] as const;

type SwingType = (typeof ALL_SWINGS)[number];
type SwingDraft = { carry: string; total: string };

function latestDistance(distances: Distance[], swingType: string) {
  return distances.find((d) => d.swingType === swingType) ?? null;
}

function clubName(club: Club) {
  return club.customName || club.defaultClub?.name || "Club";
}

function buildInitialDrafts(club: Club): Record<SwingType, SwingDraft> {
  const out = {} as Record<SwingType, SwingDraft>;
  for (const s of ALL_SWINGS) {
    const d = latestDistance(club.distances, s);
    out[s] = {
      carry: d?.carryYards != null ? String(d.carryYards) : "",
      total: d?.totalYards != null ? String(d.totalYards) : "",
    };
  }
  return out;
}

function EditClubModal({
  club,
  userId,
  initialSwingType = "full",
  onClose,
}: {
  club: Club;
  userId: number;
  initialSwingType?: string;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const isWedge = club.defaultClub?.type === "wedge";
  const [swingType, setSwingType] = useState<SwingType>(
    (ALL_SWINGS as readonly string[]).includes(initialSwingType)
      ? (initialSwingType as SwingType)
      : "full",
  );
  const currentName = club.customName ?? club.defaultClub?.name ?? "";
  const [nameDraft, setNameDraft] = useState(currentName);
  const [drafts, setDrafts] = useState<Record<SwingType, SwingDraft>>(() =>
    buildInitialDrafts(club),
  );

  const initialDrafts = buildInitialDrafts(club);
  const nameDirty = nameDraft.trim() !== currentName.trim();
  const swingsToTrack: readonly SwingType[] = isWedge
    ? ALL_SWINGS
    : (["full"] as const);
  const distancesDirty = swingsToTrack.some(
    (s) =>
      drafts[s].carry !== initialDrafts[s].carry ||
      drafts[s].total !== initialDrafts[s].total,
  );
  const dirty = nameDirty || distancesDirty;

  function updateDraft(
    swing: SwingType,
    field: "carry" | "total",
    value: string,
  ) {
    setDrafts((prev) => ({
      ...prev,
      [swing]: { ...prev[swing], [field]: value },
    }));
  }

  function parseYards(s: string): number | null {
    const trimmed = s.trim();
    if (trimmed === "") return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  }

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!dirty) {
      onClose();
      return;
    }

    const distances = swingsToTrack
      .filter(
        (s) =>
          drafts[s].carry !== initialDrafts[s].carry ||
          drafts[s].total !== initialDrafts[s].total,
      )
      .map((s) => ({
        swingType: s,
        carryYards: parseYards(drafts[s].carry),
        totalYards: parseYards(drafts[s].total),
      }));

    startTransition(async () => {
      await savePlayerClubEditsByCoach({
        userId,
        playerClubId: club.id,
        customName: nameDirty ? nameDraft.trim() || null : undefined,
        distances,
      });
      onClose();
    });
  }

  const current = drafts[swingType];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-bold text-base truncate">
            {currentName || "Club"}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground text-xl leading-none shrink-0"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSave} className="p-4 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="customName">Club name</Label>
            <Input
              id="customName"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder={club.defaultClub?.name ?? ""}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              Optional custom label shown for this golfer.
            </p>
          </div>

          <div className="border-t pt-4 space-y-3">
            {isWedge && (
              <div className="flex gap-2">
                {ALL_SWINGS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSwingType(s)}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      swingType === s
                        ? "bg-[#FFD700] border-[#FFD700] text-black"
                        : "border-zinc-200 text-muted-foreground"
                    }`}
                  >
                    {SWING_LABELS[s]}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="carryYards">Carry (yds)</Label>
                <Input
                  id="carryYards"
                  name="carryYards"
                  type="number"
                  inputMode="numeric"
                  value={current.carry}
                  onChange={(e) =>
                    updateDraft(swingType, "carry", e.target.value)
                  }
                  className="h-11"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="totalYards">Total (yds)</Label>
                <Input
                  id="totalYards"
                  name="totalYards"
                  type="number"
                  inputMode="numeric"
                  value={current.total}
                  onChange={(e) =>
                    updateDraft(swingType, "total", e.target.value)
                  }
                  className="h-11"
                />
              </div>
            </div>

            {isWedge && (
              <p className="text-xs text-muted-foreground">
                Enter each swing and save once.
              </p>
            )}

            <Button
              type="submit"
              disabled={pending || !dirty}
              className="w-full h-11 bg-[#FFD700] text-black hover:bg-[#e6c200] font-semibold disabled:opacity-50"
            >
              {pending ? "Saving..." : "Save Yardages"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function WedgeGrid({
  wedges,
  onEdit,
}: {
  wedges: Club[];
  onEdit: (club: Club, swingType: string) => void;
}) {
  if (wedges.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Wedges</CardTitle>
        <p className="text-xs text-muted-foreground">
          Tap a swing value to edit that wedge yardage.
        </p>
      </CardHeader>
      <CardContent className="px-2">
        <div className="grid grid-cols-[1fr_repeat(4,minmax(48px,1fr))] gap-x-1 gap-y-1">
          <div />
          {WEDGE_SWINGS.map((s) => (
            <div
              key={s}
              className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-1"
            >
              {SWING_LABELS[s]}
            </div>
          ))}

          {wedges.map((wedge) => (
            <div key={wedge.id} className="contents">
              <button
                type="button"
                onClick={() => onEdit(wedge, "full")}
                className="text-left text-base font-semibold truncate py-3 px-1 hover:bg-zinc-50 active:bg-zinc-100 rounded transition-colors"
                title={`Edit ${clubName(wedge)} yardages`}
              >
                {clubName(wedge)}
              </button>
              {WEDGE_SWINGS.map((swing) => {
                const yards =
                  latestDistance(wedge.distances, swing)?.carryYards ?? null;
                return (
                  <button
                    key={swing}
                    type="button"
                    onClick={() => onEdit(wedge, swing)}
                    title={`Edit ${clubName(wedge)} ${SWING_LABELS[swing]} yardage`}
                    className={`h-12 rounded-lg text-base font-bold tabular-nums transition-colors ${
                      yards !== null
                        ? "bg-zinc-100 hover:bg-zinc-200 text-foreground"
                        : "bg-zinc-50 hover:bg-zinc-100 text-muted-foreground"
                    }`}
                  >
                    {yards !== null ? yards : "-"}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ClubRow({
  club,
  onEdit,
}: {
  club: Club;
  onEdit: (club: Club) => void;
}) {
  const full = latestDistance(club.distances, "full");
  const hasDist = full && (full.carryYards != null || full.totalYards != null);

  return (
    <button
      type="button"
      onClick={() => onEdit(club)}
      className="w-full py-4 flex items-center justify-between text-left hover:bg-zinc-50 active:bg-zinc-100 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-base leading-tight">
          {clubName(club)}
        </div>
        {hasDist ? (
          <div className="flex gap-4 mt-1 flex-wrap">
            {full.carryYards != null && (
              <span className="text-sm text-muted-foreground">
                Carry{" "}
                <span className="font-bold text-foreground text-base">
                  {full.carryYards}y
                </span>
              </span>
            )}
            {full.totalYards != null && (
              <span className="text-sm text-muted-foreground">
                Total{" "}
                <span className="font-bold text-foreground text-base">
                  {full.totalYards}y
                </span>
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mt-0.5">
            Tap to add distances
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-2">
        <span className="text-xs font-medium text-muted-foreground">Edit</span>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </button>
  );
}

export default function PlayerYardagesEditor({
  clubs,
  userId,
}: {
  clubs: Club[];
  userId: number;
}) {
  const visible = clubs.filter((c) => !c.isHidden);
  const wedges = visible.filter((c) => c.defaultClub?.type === "wedge");
  const others = visible.filter((c) => c.defaultClub?.type !== "wedge");
  const hasVisible = visible.length > 0;
  const [editing, setEditing] = useState<{
    club: Club;
    swingType: string;
  } | null>(null);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="py-3">
          <p className="text-sm text-muted-foreground">
            Edit mode is enabled. Tap any wedge cell or club row to update
            yardages.
          </p>
        </CardContent>
      </Card>

      <WedgeGrid
        wedges={wedges}
        onEdit={(club, swingType) => setEditing({ club, swingType })}
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Club Distances</CardTitle>
          <p className="text-xs text-muted-foreground">
            Select a club row to edit full-swing yardages.
          </p>
        </CardHeader>
        <CardContent className="divide-y divide-zinc-100 px-4">
          {!hasVisible && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              This golfer has no active clubs yet.
            </p>
          )}
          {hasVisible && others.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No non-wedge clubs available.
            </p>
          )}
          {others.map((club) => (
            <ClubRow
              key={club.id}
              club={club}
              onEdit={(c) => setEditing({ club: c, swingType: "full" })}
            />
          ))}
        </CardContent>
      </Card>

      {editing && (
        <EditClubModal
          club={editing.club}
          userId={userId}
          initialSwingType={editing.swingType}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
