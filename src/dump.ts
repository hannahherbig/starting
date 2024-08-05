import { graphql } from './__generated__/gql'
import { inspect } from 'util'
import client from './client'

const QUERY_EVENT_SETS = graphql(`
  query EventSets($eventId: ID!, $page: Int!, $perPage: Int!) {
    event(id: $eventId) {
      id
      name
      sets(page: $page, perPage: $perPage, sortType: RECENT) {
        pageInfo {
          total
        }
        nodes {
          id
          completedAt
          winnerId
          state
          event {
            id
          }
          slots {
            id
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
`)

const QUERY_TOURNAMENT_EVENTS = graphql(`
  query GetTournamentEvents($slug: String) {
    tournament(slug: $slug) {
      id
      name
      startAt
      events(limit: 100) {
        id
      }
    }
  }
`)

;(async () => {
  const { data } = await client.query({
    query: QUERY_TOURNAMENT_EVENTS,
    variables: { slug: 'nightclub' },
  })

  console.log(inspect(data, { depth: null, colors: true }))
})()
