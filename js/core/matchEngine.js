// ========================================
// matchEngine.js
// COMPLETE MATCH ENGINE
// PART 1/4
// ========================================

export const QUARTERS = 4;
export const QUARTER_TIME = 12;
export const TOTAL_GAME_MINUTES = 48;

export const OFFENSIVE_PLAN = {
    BALANCED: "BALANCED",
    PAINT_ATTACK: "PAINT_ATTACK",
    THREE_POINT: "THREE_POINT",
    MOVE_BALL: "MOVE_BALL",
    FEED_STAR: "FEED_STAR",
    GUARD_FOCUS: "GUARD_FOCUS",
    FORWARD_FOCUS: "FORWARD_FOCUS",
    CENTER_FOCUS: "CENTER_FOCUS"
};

export const DEFENSIVE_PLAN = {
    BALANCED: "BALANCED",
    PROTECT_PAINT: "PROTECT_PAINT",
    PERIMETER_DEFENSE: "PERIMETER_DEFENSE",
    DOUBLE_TEAM: "DOUBLE_TEAM",
    NO_HELP: "NO_HELP"
};

export const ROTATION_PLAN = {
    BALANCE: "BALANCE",
    KEEP_STARTER: "KEEP_STARTER",
    BENCH_WORK: "BENCH_WORK",
    ROOKIE_WORK: "ROOKIE_WORK",
    FATIGUE_BASED: "FATIGUE_BASED"
};

export const END_GAME_PLAN = {
    BEST_PLAYERS: "BEST_PLAYERS",
    DEFENSIVE_LINEUP: "DEFENSIVE_LINEUP",
    OFFENSIVE_LINEUP: "OFFENSIVE_LINEUP",
    HOT_HAND: "HOT_HAND",
    ROOKIE_FINISH: "ROOKIE_FINISH"
};

const CONDITION = {
    EXCELLENT: "Excellent",
    GOOD: "Good",
    HEALTHY: "Healthy",
    SICK: "Sick",
    EXHAUSTED: "Exhausted"
};

const ROLE = {
    STAR: "STAR",
    STARTER: "STARTER",
    SIXTH: "SIXTH_MAN",
    BENCH: "ROLE_PLAYER",
    PROSPECT: "PROSPECT"
};

export function random(min, max) {
    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}

function clamp(value, min = 0, max = 100) {
    return Math.max(
        min,
        Math.min(max, value)
    );
}

function getAttr(player, key) {
    const value =
        player?.attributes?.[key];

    return Number.isFinite(value)
        ? value
        : 50;
}

function getPosition(player) {
    return (
        player?.creation?.position ??
        null

    );
}

function getCondition(player) {
    return (
        player?.status?.condition ||
        CONDITION.HEALTHY
    );
}

function isRookie(player) {
    return (
        (player?.career?.seasons ?? 1) === 0
    );
}

export function getStartingFive(team) {

    return team.roster.filter(
        player =>
            player.role === ROLE.STARTER
    );

}

export function getBench(team) {

    return team.roster.filter(
        player =>
            player.role !== ROLE.STARTER
    );

}

export function createMatchPlayer(player) {

    return {

        player,

        stamina:
            clamp(
                getAttr(
                    player,
                    "stamina"
                )
            ),

        onCourt:
            player.role === ROLE.STARTER,

        minutes: 0,

        foul: 0,

        foulOut: false,

        injured: false,

        stats: {

            fgm: 0,
            fga: 0,

            tpm: 0,
            tpa: 0,

            ftm: 0,
            fta: 0,

            points: 0,
            rebounds: 0,
            assists: 0,
            steals: 0,
            blocks: 0,
            turnovers: 0

        }

    };

}

export function createMatchTeam(team) {

    const players =
        team.roster.map(
            player => ({
                ...createMatchPlayer(
                    player
                ),
                onCourt: false
            })
        );

    const starters =
        players.filter(
            p =>
                p.player.role ===
                ROLE.STARTER
        );

    const lineup =
        starters.slice(0, 5);

    if (lineup.length < 5) {

        const extras =
            players
                .filter(
                    p =>
                        !lineup.includes(p)
                )
                .sort(
                    (a, b) =>
                        (b.player.overall || 0) -
                        (a.player.overall || 0)
                );

        lineup.push(
            ...extras.slice(
                0,
                5 - lineup.length
            )
        );

    }

    lineup.forEach(
        player => {
            player.onCourt = true;
        }
    );

    return {

        info: team,

        offensivePlan:
            team.coach?.offensivePlan ||
            OFFENSIVE_PLAN.BALANCED,

        defensivePlan:
            team.coach?.defensivePlan ||
            DEFENSIVE_PLAN.BALANCED,

        rotationPlan:
            team.coach?.rotationPlan ||
            ROTATION_PLAN.BALANCE,

        endGamePlan:
            team.coach?.endGamePlan ||
            END_GAME_PLAN.BEST_PLAYERS,

        players,

        score: 0

    };

}

// ========================================
// STAMINA
// ========================================

function getStaminaDrain(matchPlayer) {

    const condition =
        getCondition(
            matchPlayer.player
        );

    let drain;

    switch (condition) {

        case CONDITION.EXCELLENT:

            drain = random(1, 2);

            break;

        case CONDITION.GOOD:

            drain = random(1, 3);

            break;

        case CONDITION.HEALTHY:

            drain = random(2, 3);

            break;

        case CONDITION.SICK:

            drain = random(2, 4);

            break;

        case CONDITION.EXHAUSTED:

            drain = random(3, 5);

            break;

        default:

            drain = random(1, 4);

    }

    /*
        Khi stamina đã xuống rất thấp,
        tiếp tục thi đấu sẽ khó giữ sức hơn.
    */

    if (matchPlayer.stamina < 25) {

        drain += random(0, 1);

    }

    return drain;
}

export function updateStamina(matchPlayer) {

    if (!matchPlayer.onCourt) {

        matchPlayer.stamina =
            clamp(
                matchPlayer.stamina +
                random(4, 7)
            );

        return;

    }

    matchPlayer.stamina =
        clamp(
            matchPlayer.stamina -
            getStaminaDrain(
                matchPlayer
            )
        );

}

export function quarterRecovery(team) {

    team.players.forEach(
        player => {

            player.stamina =
                clamp(
                    player.stamina + 10
                );

        }
    );

}

export function halftimeRecovery(team) {

    team.players.forEach(
        player => {

            player.stamina =
                clamp(
                    player.stamina + 20
                );

        }
    );

}

export function overtimeRecovery(team) {

    team.players.forEach(
        player => {

            player.stamina =
                clamp(
                    player.stamina + 5
                );

        }
    );

}


// ========================================
// ROTATION
// ========================================

function replacementCandidates(
    team,
    current,
    rotationPlan
) {

    let candidates =
        team.players.filter(
            p =>
                !p.onCourt &&
                !p.injured &&
                !p.foulOut
        );

    if (!candidates.length) {
        return [];
    }

    if (
        rotationPlan ===
        ROTATION_PLAN.ROOKIE_WORK
    ) {

        const rookies =
            candidates.filter(
                p =>
                    isRookie(p.player) &&
                    getPosition(
                        p.player
                    ) ===
                    getPosition(
                        current.player
                    )
            );

        if (rookies.length) {
            candidates = rookies;
        }

    }

    const samePosition =
        candidates.filter(
            p =>
                getPosition(
                    p.player
                ) ===
                getPosition(
                    current.player
                )
        );

    if (samePosition.length) {
        candidates = samePosition;
    }

    return candidates;

}

export function findBenchReplacement(
    team,
    position,
    current = null
) {

    let candidates =
        team.players.filter(
            p =>
                !p.onCourt &&
                !p.injured &&
                !p.foulOut
        );

    if (!candidates.length) {
        return null;
    }

    const samePosition =
        candidates.filter(
            p =>
                getPosition(
                    p.player
                ) === position
        );

    if (samePosition.length) {
        candidates =
            samePosition;
    }

    candidates.sort(
        (a, b) => {

            const aOverall =
                Number.isFinite(
                    a.player?.overall
                )
                    ? a.player.overall
                    : 0;

            const bOverall =
                Number.isFinite(
                    b.player?.overall
                )
                    ? b.player.overall
                    : 0;

            const aValue =
                (
                    a.stamina +
                    aOverall
                ) / 2 +
                random(-5, 5);

            const bValue =
                (
                    b.stamina +
                    bOverall
                ) / 2 +
                random(-5, 5);

            return bValue - aValue;
        }
    );

    return candidates[0] || null;
}

export function shouldSubstitute(
    player,
    rotationPlan
) {

    const stamina =
        player.stamina;

    switch (rotationPlan) {

        case ROTATION_PLAN.BALANCE:
            return stamina <= 40;

        case ROTATION_PLAN.KEEP_STARTER:
            return stamina <= random(10, 20);

        case ROTATION_PLAN.BENCH_WORK:
            return stamina <= 50;

        case ROTATION_PLAN.ROOKIE_WORK:
            return stamina <= 40;

        case ROTATION_PLAN.FATIGUE_BASED:
            return stamina <= random(35, 55);

        default:
            return false;

    }

}

function shouldRemoveRookie(
    player
) {

    return player.stamina <= 30;

}

function isBlowout(
    team,
    opponent
) {

    return (
        Math.abs(
            team.score -
            opponent.score
        ) >= 15
    );

}

function chooseReplacement(
    team,
    current,
    opponent
) {

    const plan =
        team.rotationPlan;

    let candidates =
        replacementCandidates(
            team,
            current,
            plan
        );

    if (!candidates.length) {

        return findBenchReplacement(
            team,
            getPosition(
                current.player
            ),
            current
        );

    }

    if (
        plan ===
        ROTATION_PLAN.ROOKIE_WORK
    ) {

        const rookies =
            candidates.filter(
                p =>
                    isRookie(
                        p.player
                    )
            );

        if (rookies.length) {
            candidates = rookies;
        }

    }

    if (
        plan ===
        ROTATION_PLAN.BENCH_WORK
    ) {

        candidates.sort(
            (a, b) =>
                (
                    b.stamina +
                    random(0, 10)
                ) -
                (
                    a.stamina +
                    random(0, 10)
                )
        );

    } else if (
        plan ===
        ROTATION_PLAN.FATIGUE_BASED
    ) {

        candidates.sort(
            (a, b) =>
                b.stamina -
                a.stamina
        );

    } else {

        candidates.sort(
            (a, b) =>
                (
                    (b.player.overall || 0) +
                    random(0, 5)
                ) -
                (
                    (a.player.overall || 0) +
                    random(0, 5)
                )
        );

    }

    return candidates[0] || null;

}

export function substitution(
    team,
    opponent = null
) {

    const active =
        team.players.filter(
            p =>
                p.onCourt &&
                !p.injured &&
                !p.foulOut
        );

    for (
        const current of active
    ) {

        if (
            current.foulOut ||
            current.injured
        ) {

            current.onCourt =
                false;

            const replacement =
                chooseReplacement(
                    team,
                    current,
                    opponent
                );

            if (replacement) {
                replacement.onCourt =
                    true;
            }

            continue;

        }

        const rookieOut =
            team.rotationPlan ===
                ROTATION_PLAN.ROOKIE_WORK &&
            isRookie(
                current.player
            ) &&
            shouldRemoveRookie(
                current
            );

        const blowout =
            opponent
                ? isBlowout(
                    team,
                    opponent
                )
                : false;

        const shouldRest =
            shouldSubstitute(
                current,
                team.rotationPlan
            );

        if (
            !shouldRest &&
            !rookieOut
        ) {
            continue;
        }

        if (
            team.rotationPlan ===
            ROTATION_PLAN.KEEP_STARTER &&
            !current.foulOut &&
            !current.injured &&
            current.stamina > 10
        ) {
            continue;
        }

        if (
            team.rotationPlan ===
            ROTATION_PLAN.ROOKIE_WORK &&
            !isRookie(
                current.player
            ) &&
            !blowout &&
            current.stamina > 40
        ) {
            continue;
        }

        const replacement =
            chooseReplacement(
                team,
                current,
                opponent
            );

        if (!replacement) {
            continue;
        }

        current.onCourt =
            false;

        replacement.onCourt =
            true;

    }

}

// ========================================
// ACTION ENGINE
// ========================================

function roleWeight(player) {

    switch (player.role) {

        case ROLE.STAR:
            return random(115, 145) / 100;

        case ROLE.STARTER:
            return random(95, 120) / 100;

        case ROLE.SIXTH:
            return random(90, 110) / 100;

        case ROLE.BENCH:
            return random(80, 105) / 100;

        case ROLE.PROSPECT:
            return random(75, 100) / 100;

        default:
            return random(90, 110) / 100;

    }

}

function positionWeight(
    player,
    action
) {

    const position =
        getPosition(player);

    let weight = 1;



    /*
        Position chỉ tạo xu hướng,
        không khóa action.

        Mọi player vẫn có thể:
        - ném 3
        - chuyền
        - dunk
        - ném 2
    */

    if (action === "PASS") {

        if (
            position === "PG" ||
            position === "SF"
        ) {
            weight *=
                random(100, 125) / 100;
        }

    }



    if (action === "THREE_POINT") {

        if (
            position === "SG" ||
            position === "PG"
        ) {
            weight *=
                random(100, 120) / 100;
        }

        if (
            position === "PF" ||
            position === "SF" ||
            position === "C"
        ) {
            weight *=
                random(90, 110) / 100;
        }

    }



    if (action === "DUNK") {

        if (
            position === "PF" ||
            position === "C" ||
            position === "SF"
        ) {
            weight *=
                random(100, 125) / 100;
        }

    }



    return weight;

}


function offensivePlanWeight(
    team,
    player,
    action
) {

    const plan =
        team.offensivePlan;

    const position =
        getPosition(player);



    if (
        plan ===
        OFFENSIVE_PLAN.THREE_POINT
    ) {

        if (action === "THREE_POINT") {

            return random(135, 175) / 100;

        }

    }



    if (
        plan ===
        OFFENSIVE_PLAN.PAINT_ATTACK
    ) {

        if (
            action === "TWO_POINT" ||
            action === "DUNK"
        ) {

            return random(125, 165) / 100;

        }

    }



    if (
        plan ===
        OFFENSIVE_PLAN.MOVE_BALL
    ) {

        if (action === "PASS") {

            return random(140, 180) / 100;

        }

    }



    if (
        plan ===
        OFFENSIVE_PLAN.GUARD_FOCUS
    ) {

        if (
            position === "PG" ||
            position === "SG"
        ) {

            return random(120, 150) / 100;

        }

    }



    if (
        plan ===
        OFFENSIVE_PLAN.FORWARD_FOCUS
    ) {

        if (
            position === "SF" ||
            position === "PF"
        ) {

            return random(120, 150) / 100;

        }

    }



    if (
        plan ===
        OFFENSIVE_PLAN.CENTER_FOCUS &&
        position === "C"
    ) {

        return random(130, 165) / 100;

    }



    if (
        plan ===
        OFFENSIVE_PLAN.FEED_STAR
    ) {

        if (
            player.role === ROLE.STAR
        ) {

            return action === "PASS"

                ? random(65, 85) / 100

                : random(135, 170) / 100;

        }

    }



    return random(95, 105) / 100;

}

function getActionWeight(
    team,
    player,
    action
) {

    let weight = 1;

    switch (action) {

        case "TWO_POINT":

            weight =
                getAttr(player, "shoot") +
                getAttr(player, "handle") +
                getAttr(player, "dunk");

            break;

        case "THREE_POINT":

            weight =
                getAttr(player, "threePoint") +
                getAttr(player, "shoot");

            break;

        case "PASS":

            weight =
                getAttr(player, "pass") +
                getAttr(player, "handle");

            break;

        case "DUNK":

            weight =
                getAttr(player, "dunk") +
                getAttr(player, "strength");

            break;

        default:
            weight = 1;

    }

    return (
        Math.max(1, weight) *
        positionWeight(
            player,
            action
        ) *
        roleWeight(player) *
        offensivePlanWeight(
            team,
            player,
            action
        )
    );

}

function weightedPick(items) {

    const total =
        items.reduce(
            (
                sum,
                item
            ) =>
                sum + item.weight,
            0
        );

    if (total <= 0) {
        return items[0]?.value ||
            null;
    }

    let roll =
        Math.random() *
        total;

    for (
        const item of items
    ) {

        roll -= item.weight;

        if (roll <= 0) {
            return item.value;
        }

    }

    return (
        items[
            items.length - 1
        ]?.value || null
    );

}

function chooseBallHandler(team) {

    const players =
        team.players.filter(
            p =>
                p.onCourt &&
                !p.injured &&
                !p.foulOut
        );

    if (!players.length) {
        return null;
    }

    return weightedPick(

        players.map(
            player => {

                const overall =
                    Number.isFinite(
                        player.player.overall
                    )
                        ? player.player.overall
                        : 50;

                const handle =
                    getAttr(
                        player.player,
                        "handle"
                    ) || 0;

                const pass =
                    getAttr(
                        player.player,
                        "pass"
                    ) || 0;

                const shoot =
                    getAttr(
                        player.player,
                        "shoot"
                    ) || 0;

                const weight =
                    (
                        overall +
                        handle +
                        pass +
                        shoot
                    ) /
                    4;



                return {

                    value: player,

                    weight:
                        Math.max(
                            1,
                            weight *
                            roleWeight(
                                player.player
                            ) *
                            offensivePlanWeight(
                                team,
                                player.player,
                                "PASS"
                            ) *
                            (
                                random(
                                    90,
                                    110
                                ) / 100
                            )
                        )

                };

            }
        )

    );

}

function chooseAction(
    team,
    player
) {

    const actions = [

        "TWO_POINT",
        "THREE_POINT",
        "PASS",
        "DUNK"

    ];

    return weightedPick(

        actions.map(
            action => ({

                value: action,

                weight:
                    getActionWeight(
                        team,
                        player.player,
                        action
                    )

            })
        )

    );

}

function actionQuality(
    player,
    action,
    context = {}
) {

    let base;

    switch (action) {

        case "TWO_POINT":

            base =
                (
                    getAttr(
                        player,
                        "shoot"
                    ) +
                    getAttr(
                        player,
                        "handle"
                    ) +
                    getAttr(
                        player,
                        "dunk"
                    )
                ) / 3;

            break;

        case "THREE_POINT":

            base =
                (
                    getAttr(
                        player,
                        "shoot"
                    ) +
                    getAttr(
                        player,
                        "threePoint"
                    )
                ) / 2;

            break;

        case "PASS":

            base =
                (
                    getAttr(
                        player,
                        "pass"
                    ) +
                    getAttr(
                        player,
                        "handle"
                    )
                ) / 2;

            break;

        case "DUNK":

            base =
                (
                    getAttr(
                        player,
                        "dunk"
                    ) +
                    getAttr(
                        player,
                        "strength"
                    )
                ) / 2;

            break;

        case "FREE_THROW":

            base =
                getAttr(
                    player,
                    "shoot"
                );

            break;

        default:

            base =
                player.overall ||
                50;

    }

    const stamina =
        context.stamina ?? 100;

    if (stamina < 40) {

        base -= random(0, 3);

    }

    if (stamina < 20) {

        base -= random(1, 4);

    }


// ========================================
// POSSESSION DEFENSE
// ========================================

function getDefender(
    team,
    action
) {

    const players =
        team.players.filter(
            p =>
                p.onCourt &&
                !p.injured &&
                !p.foulOut
        );

    if (!players.length) {
        return null;
    }

    const weighted =
        players.map(
            player => {

                let weight =
                    getAttr(
                        player.player,
                        "defense"
                    ) +
                    getAttr(
                        player.player,
                        "speed"
                    );

                if (
                    team.defensivePlan ===
                    DEFENSIVE_PLAN.PROTECT_PAINT &&
                    (
                        action ===
                        "TWO_POINT" ||
                        action ===
                        "DUNK"
                    )
                ) {
                    weight *=
                        random(125, 155) / 100;
                }

                if (
                    team.defensivePlan ===
                    DEFENSIVE_PLAN.PERIMETER_DEFENSE &&
                    action ===
                    "THREE_POINT"
                ) {
                    weight *=
                        random(125, 155) / 100;
                }

                if (
                    team.defensivePlan ===
                    DEFENSIVE_PLAN.DOUBLE_TEAM
                ) {
                    weight *=
                        random(105, 130) / 100;
                }

                return {
                    value: player,
                    weight:
                        Math.max(
                            1,
                            weight
                        )
                };

            }
        );

    return weightedPick(
        weighted
    );

}

function tryDefensiveEvent(
    defTeam,
    offensePlayer,
    action
) {

    const defender =
        getDefender(
            defTeam,
            action
        );

    if (!defender) {
        return null;
    }

    let stealChance =
        (
            getAttr(
                defender.player,
                "defense"
            ) +
            getAttr(
                defender.player,
                "speed"
            )
        ) / 400;

    let blockChance =
        (
            getAttr(
                defender.player,
                "defense"
            ) +
            getAttr(
                defender.player,
                "strength"
            )
        ) / 500;

    if (
        defTeam.defensivePlan ===
        DEFENSIVE_PLAN.DOUBLE_TEAM
    ) {
        stealChance *=
            random(120, 145) / 100;
    }

    if (
        defTeam.defensivePlan ===
        DEFENSIVE_PLAN.PERIMETER_DEFENSE &&
        action === "THREE_POINT"
    ) {
        stealChance *=
            random(115, 135) / 100;
    }

    if (
        defTeam.defensivePlan ===
        DEFENSIVE_PLAN.PROTECT_PAINT &&
        (
            action === "TWO_POINT" ||
            action === "DUNK"
        )
    ) {
        blockChance *=
            random(120, 145) / 100;
    }

    if (
        Math.random() <
        clamp(
            stealChance,
            0,
            0.25
        ) &&
        action !== "FREE_THROW"
    ) {

        defender.stats.steals++;

        offensePlayer.stats.turnovers++;

        return "STEAL";

    }

    if (
        Math.random() <
        clamp(
            blockChance,
            0,
            0.18
        ) &&
        (
            action === "TWO_POINT" ||
            action === "DUNK"
        )
    ) {

        defender.stats.blocks++;

        return "BLOCK";

    }

    return null;

}

// ========================================
// FOUL
// ========================================

function addFoul(team) {

    const defenders =
        team.players.filter(
            p =>
                p.onCourt &&
                !p.injured &&
                !p.foulOut
        );

    if (!defenders.length) {
        return null;
    }

    const defender =
        weightedPick(

            defenders.map(
                p => ({

                    value: p,

                    weight:
                        1 +
                        random(0, 100) / 100

                })
            )

        );

    if (!defender) {
        return null;
    }

    defender.foul++;

    if (defender.foul >= 6) {

        defender.foulOut = true;
        defender.onCourt = false;

    }

    return defender;

}

function shootFreeThrows(
    matchPlayer,
    count = 1
) {

    for (
        let i = 0;
        i < count;
        i++
    ) {

        matchPlayer.stats.fta++;

        const quality =
            actionQuality(
                matchPlayer.player,
                "FREE_THROW",
                {
                    stamina:
                        matchPlayer.stamina
                }
            );

        if (
            Math.random() <
            quality / 100
        ) {

            matchPlayer.stats.ftm++;
            matchPlayer.stats.points++;

        }

    }

}

function recordShot(
    offensePlayer,
    defenderTeam,
    action,
    points
) {

    offensePlayer.stats.fga++;

    if (
        action ===
        "THREE_POINT"
    ) {

        offensePlayer.stats.tpa++;

    }

    const quality =
        actionQuality(
            offensePlayer.player,
            action,
            {
                stamina:
                    offensePlayer.stamina
            }
        );

    let defensePenalty = 0;

    if (
        defenderTeam.defensivePlan ===
        DEFENSIVE_PLAN.PERIMETER_DEFENSE &&
        action ===
        "THREE_POINT"
    ) {

        defensePenalty =
            random(2, 7);

    }

    if (
        defenderTeam.defensivePlan ===
        DEFENSIVE_PLAN.PROTECT_PAINT &&
        (
            action ===
            "TWO_POINT" ||
            action ===
            "DUNK"
        )
    ) {

        defensePenalty =
            random(2, 7);

    }

    const made =
        Math.random() <
        clamp(
            quality -
            defensePenalty,
            1,
            99
        ) / 100;

    if (!made) {
        return false;
    }

    offensePlayer.stats.fgm++;

    if (
        action ===
        "THREE_POINT"
    ) {
        offensePlayer.stats.tpm++;
    }

    offensePlayer.stats.points +=
        points;

    return true;

}


// ========================================
// SIMULATE POSSESSION
// ========================================

export function simulatePossession(
    offense,
    defense
) {

    const offensePlayer =
        chooseBallHandler(
            offense
        );

    if (!offensePlayer) {
        return;
    }

    const action =
        chooseAction(
            offense,
            offensePlayer
        );

    const defensiveEvent =
        tryDefensiveEvent(
            defense,
            offensePlayer,
            action
        );

    if (
        defensiveEvent === "STEAL" ||
        defensiveEvent === "BLOCK"
    ) {
        return;
    }

    if (
        Math.random() <
        (
            defense.defensivePlan ===
            DEFENSIVE_PLAN.DOUBLE_TEAM
                ? random(5, 8) / 100
                : random(3, 6) / 100
        )
    ) {

        const fouler =
            addFoul(
                defense
            );

        if (fouler) {

            /*
            Shooting foul:

            3PT → 3 FT
            2PT/DUNK → 2 FT

            Non-shooting foul:
            không có FT.
            */

            const shootingFoul =
                Math.random() <
                random(45, 75) / 100;

            if (shootingFoul) {

                const beforePoints =
                    offensePlayer.stats.points;

                const freeThrows =
                    action ===
                    "THREE_POINT"
                        ? 3
                        : 2;

                shootFreeThrows(
                    offensePlayer,
                    freeThrows
                );

                offense.score +=
                    offensePlayer.stats.points -
                    beforePoints;

            }

            return;

        }

    }

    if (
        action === "PASS"
    ) {

        const teammates =
            offense.players.filter(
                p =>
                    p.onCourt &&
                    p !== offensePlayer &&
                    !p.injured &&
                    !p.foulOut
            );

        if (!teammates.length) {
            return;
        }

        const receiver =
            weightedPick(

                teammates.map(
                    p => ({

                        value: p,

                        weight:
                            getAttr(
                                p.player,
                                "shoot"
                            ) +
                            getAttr(
                                p.player,
                                "threePoint"
                            ) +
                            (
                                p.player.overall ||
                                50
                            )

                    })
                )

            );

        const quality =
            actionQuality(
                offensePlayer.player,
                "PASS",
                {
                    stamina:
                        offensePlayer.stamina
                }
            );

        if (
            receiver &&
            Math.random() <
            quality / 100
        ) {

            let shotAction =
                chooseAction(
                    offense,
                    receiver
                );

            if (
                shotAction === "PASS"
            ) {

                shotAction =
                    Math.random() <
                    random(35, 65) / 100
                        ? "TWO_POINT"
                        : "THREE_POINT";

            }

            if (
                shotAction !== "THREE_POINT" &&
                shotAction !== "TWO_POINT" &&
                shotAction !== "DUNK"
            ) {

                shotAction = "TWO_POINT";

            }

            const made =
                recordShot(
                    receiver,
                    defense,
                    shotAction,
                    shotAction ===
                    "THREE_POINT"
                        ? 3
                        : 2
                );

            if (made) {

                offensePlayer.stats.assists++;

                offense.score +=
                    shotAction ===
                    "THREE_POINT"
                        ? 3
                        : 2;

            }

            return;

        }

        offensePlayer.stats.turnovers++;

        return;

    }

    const points =
        action ===
        "THREE_POINT"
            ? 3
            : 2;

    const made =
        recordShot(
            offensePlayer,
            defense,
            action,
            points
        );

    if (made) {

        offense.score +=
            points;

        return;

    }

    const reboundTeam =
        Math.random() <
        random(15, 30) / 100
          ? offense
          : defense;

    const rebounders =
        reboundTeam.players.filter(
            p =>
                p.onCourt &&
                !p.injured &&
                !p.foulOut
        );

    if (!rebounders.length) {
        return;
    }

    const rebounder =
        weightedPick(

            rebounders.map(
                p => ({

                    value: p,

                    weight:
                        getAttr(
                            p.player,
                           "rebound"
                        ) +
                        getAttr(
                            p.player,
                            "strength"
                        ) +
                        random(0, 20)

                })
            )

        );

    if (rebounder) {

        rebounder.stats.rebounds++;

    }


// ========================================
// QUARTER
// ========================================

function simulateQuarter(
    home,
    away
) {

    const possessions =
        random(22, 28);

    for (
        let i = 0;
        i < possessions;
        i++
    ) {

        simulatePossession(
            home,
            away
        );

        simulatePossession(
            away,
            home
        );

        home.players.forEach(
            updateStamina
        );

        away.players.forEach(
            updateStamina
        );

        home.players.forEach(
            p => {

                if (
                    p.onCourt &&
                    !p.injured &&
                    !p.foulOut
                ) {

                    p.minutes +=
                        12 / possessions;

                }

            }
        );

        away.players.forEach(
            p => {

                if (
                    p.onCourt &&
                    !p.injured &&
                    !p.foulOut
                ) {

                    p.minutes +=
                        12 / possessions;

                }

            }
        );

        substitution(
            home,
            away
        );

        substitution(
            away,
            home
        );

    }

}

export function generatePossessions() {
    return random(22, 28);
}


// ========================================
// OVERTIME
// ========================================

export function simulateOvertime(
    homeTeam,
    awayTeam
) {

    overtimeRecovery(
        homeTeam
    );

    overtimeRecovery(
        awayTeam
    );

    const possessions =
        random(15, 30);

    for (
        let i = 0;
        i < possessions;
        i++
    ) {

        simulatePossession(
            homeTeam,
            awayTeam
        );

        simulatePossession(
            awayTeam,
            homeTeam
        );

        homeTeam.players.forEach(
            updateStamina
        );

        awayTeam.players.forEach(
            updateStamina
        );

        homeTeam.players.forEach(
            p => {

                if (
                    p.onCourt &&
                    !p.injured &&
                    !p.foulOut
                ) {

                    p.minutes +=
                        5 / possessions;

                }

            }
        );

        awayTeam.players.forEach(
            p => {

                if (
                    p.onCourt &&
                    !p.injured &&
                    !p.foulOut
                ) {

                    p.minutes +=
                        5 / possessions;

                }

            }
        );

        substitution(
            homeTeam,
            awayTeam
        );

        substitution(
            awayTeam,
            homeTeam
        );

    }

}


// ========================================
// MATCH
// ========================================

export function simulateMatch(
    homeTeam,
    awayTeam
) {

    const home =
        createMatchTeam(
            homeTeam
        );

    const away =
        createMatchTeam(
            awayTeam
        );

    for (
        let quarter = 1;
        quarter <= QUARTERS;
        quarter++
    ) {

        simulateQuarter(
            home,
            away
        );

        if (
            quarter === 2
        ) {

            halftimeRecovery(
                home
            );

            halftimeRecovery(
                away
            );

        } else if (
            quarter < 4
        ) {

            quarterRecovery(
                home
            );

            quarterRecovery(
                away
            );

        }

    }

    while (
        home.score ===
        away.score
    ) {

        simulateOvertime(
            home,
            away
        );

    }

    const homeBox =
        generateTeamBoxScore(
            home
        );

    const awayBox =
        generateTeamBoxScore(
            away
        );

    const winner =
        home.score >
        away.score
            ? home
            : away;

    const loser =
        winner === home
            ? away
            : home;

    const winnerBox =
        winner === home
            ? homeBox
            : awayBox;

    const result = {

        winner:
            winner.info,

        loser:
            loser.info,

        homeScore:
            home.score,

        awayScore:
            away.score,

        homeBox,

        awayBox,

        mvp:
            getMOTM(
                winnerBox
            )

    };

    applyMatchResult(
        result
    );

    return result;

}


// ========================================
// TEAM BOXSCORE
// ========================================

export function generateTeamBoxScore(
    matchTeam
) {

    return matchTeam.players
        .filter(
            p =>
                p.minutes > 0 ||
                Object.values(
                    p.stats
                ).some(
                    value =>
                        value > 0
                )
        )
        .map(
            p => ({

                playerId:
                    p.player.id,

                player:
                    p.player,

                minutes:
                    Math.round(
                        p.minutes * 10
                    ) / 10,

                fieldGoals: {

                    made:
                        p.stats.fgm,

                    attempted:
                        p.stats.fga

                },

                threePoints: {

                    made:
                        p.stats.tpm,

                    attempted:
                        p.stats.tpa

                },

                freeThrows: {

                    made:
                        p.stats.ftm,

                    attempted:
                        p.stats.fta

                },

                points:
                    p.stats.points,

                rebounds:
                    p.stats.rebounds,

                assists:
                    p.stats.assists,

                steals:
                    p.stats.steals,

                blocks:
                    p.stats.blocks,

                turnovers:
                    p.stats.turnovers,

                fouls:
                    p.foul,

                foulOut:
                    p.foulOut

            })
        );

}


// ========================================
// MVP
// ========================================

export function getMOTM(
    boxscore
) {

    let best = null;

    let bestValue = -Infinity;

    for (
        const player of boxscore
    ) {

        const fga =
            player.fieldGoals.attempted;

        const fg =
            fga > 0
                ? player.fieldGoals.made /
                  fga
                : 0;

        const value =
            player.points +
            player.assists * 1.25 +
            player.rebounds * 1.15 +
            player.steals * 1.5 +
            player.blocks * 1.5 +
            fg * 7.3 -
            player.turnovers * 1.25;

        if (
            value >
            bestValue
        ) {

            bestValue =
                value;

            best =
                player;

        }

    }

    return best;

}


// ========================================
// DOUBLE / TRIPLE DOUBLE
// ========================================

export function isDoubleDouble(
    stat
) {

    let count = 0;

    if (
        stat.points >= 10
    ) count++;

    if (
        stat.rebounds >= 10
    ) count++;

    if (
        stat.assists >= 10
    ) count++;

    if (
        stat.steals >= 10
    ) count++;

    if (
        stat.blocks >= 10
    ) count++;

    return count >= 2;

}

export function isTripleDouble(
    stat
) {

    let count = 0;

    if (
        stat.points >= 10
    ) count++;

    if (
        stat.rebounds >= 10
    ) count++;

    if (
        stat.assists >= 10
    ) count++;

    if (
        stat.steals >= 10
    ) count++;

    if (
        stat.blocks >= 10
    ) count++;

    return count >= 3;

}

export function applyMatchResult(
    match
) {

    const allPlayers = [

        ...match.homeBox,

        ...match.awayBox

    ];

    allPlayers.forEach(
        stat => {

            stat.doubleDouble =
                isDoubleDouble(
                    stat
                );

            stat.tripleDouble =
                isTripleDouble(
                    stat
                );

        }
    );

    return match;

}