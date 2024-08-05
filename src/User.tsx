import React, { useEffect } from 'react'
import { useQuery } from '@apollo/client'

import { graphql } from './__generated__/gql'
import _ from 'lodash'
import { Player, Set } from './__generated__/graphql'

const PER_PAGE = 32
type SetsRecord = Record<string, Set>

function getNextPage<
  T extends
    | {
        pageInfo?: {
          page?: number | null
          totalPages?: number | null
        } | null
      }
    | null
    | undefined,
>(...args: T[]) {
  let page = 0
  let totalPages = 0
  for (const arg of args) {
    const argPage = arg?.pageInfo?.page
    const argTotalPages = arg?.pageInfo?.totalPages
    if (argPage && argTotalPages) {
      if (argPage > page) {
        page = argPage
      }
      if (argTotalPages > totalPages) {
        totalPages = argTotalPages
      }
    }
  }
  if (page < totalPages) {
    return page + 1
  }
  return 0
}

function str(x: string | number | null | undefined) {
  return x ? x + '' : ''
}

export default function User({ slug = 'user/2b4426ec' }: { slug?: string }) {
  const { loading, data, fetchMore } = useQuery(
    graphql(`
      query GetUser($slug: String, $page: Int, $perPage: Int) {
        user(slug: $slug) {
          player {
            id
            gamerTag
          }
          player {
            sets(page: $page, perPage: $perPage) {
              pageInfo {
                totalPages
                page
              }
              nodes {
                id
                completedAt
                createdAt
                startedAt
                fullRoundText
                identifier
                winnerId
                state
                event {
                  id
                  name
                  tournament {
                    id
                    name
                  }
                }
                slots {
                  standing {
                    entrant {
                      id
                      name
                      participants {
                        player {
                          id
                          prefix
                          gamerTag
                        }
                      }
                    }
                    stats {
                      score {
                        value
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `),
    {
      variables: { slug, page: 1, perPage: PER_PAGE },
    },
  )
  const nextPage = getNextPage(data?.user?.player?.sets)

  useEffect(() => {
    if (nextPage) {
      fetchMore({
        variables: {
          slug,
          page: nextPage,
          perPage: PER_PAGE,
        },
      })
    }
  }, [nextPage, slug, fetchMore])

  if (loading) {
    return <p>Loading ...</p>
  }

  const myPlayerId = str(data?.user?.player?.id)

  type MySetSlot = {
    player: string
    entrant: string
    prefix: string
    tag: string
    scoreLabel: string
  }
  type MySet = {
    tournament: string
    event: string
    round: string
    slots: MySetSlot[]
    winner: string
    time: string
  }

  function winRate(sets: MySet[]) {
    let wins = 0
    let losses = 0
    sets.forEach((set) => {
      const winner = set.slots.find((slot) => slot.entrant === set.winner)
      const me = set.slots.find((slot) => slot.player === myPlayerId)
      if (winner && me) {
        if (winner.player === me.player) {
          wins++
        } else {
          losses++
        }
      }
    })
    const total = wins + losses
    const rate = wins / total
    return { wins, losses, total, rate }
  }

  const setsTable: MySet[] = []
  data?.user?.player?.sets?.nodes?.forEach((set) => {
    const slots: MySetSlot[] = []
    set?.slots?.forEach((setslot) => {
      const standing = setslot?.standing
      const entrant = standing?.entrant
      const score = standing?.stats?.score?.value
      const won = str(set.winnerId) === str(entrant?.id)
      const scoreLabel =
        score === -1
          ? 'DQ'
          : typeof score === 'number'
          ? score + ''
          : set.winnerId
          ? won
            ? 'W'
            : 'L'
          : '?'
      if (standing?.entrant?.participants?.length === 1) {
        const [participant] = standing.entrant.participants
        const player = participant?.player
        if (player?.id) {
          slots.push({
            player: str(player.id),
            entrant: str(standing.entrant.id),
            prefix: str(player.prefix),
            tag: str(player.gamerTag),
            scoreLabel,
          })
        }
      }
    })
    setsTable.push({
      tournament: str(set?.event?.tournament?.name),
      event: str(set?.event?.name),
      round: str(set?.fullRoundText),
      winner: str(set?.winnerId),
      slots: slots,
      time: str(set?.completedAt),
    })
  })

  const r = winRate(setsTable)

  return (
    <>
      {/* <h1>
        {r.rate.toFixed(1)}% {r.wins}-{r.losses}
      </h1> */}
      <table>
        <thead>
          <tr>
            <th>tournament</th>
            <th>event</th>
            <th>round</th>
            <th>entrants</th>
          </tr>
        </thead>
        <tbody>
          {_.orderBy(setsTable, ['time'], ['desc']).map(
            ({ tournament, event, round, slots }) => (
              <tr>
                <td>{tournament}</td>
                <td>{event}</td>
                <td>{round}</td>
                <td>
                  {slots?.map(({ scoreLabel, prefix, tag }) => (
                    <li>
                      {scoreLabel} - <i>{prefix}</i> {tag}
                    </li>
                  ))}
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </>
  )
}
