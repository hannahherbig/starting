import React from 'react'
import { useQuery } from '@apollo/client'

import { graphql } from './__generated__/gql'
import { range } from 'lodash'

const GET_EVENT = graphql(`
  query GetEvent($slug: String) {
    event(slug: $slug) {
      id
      createdAt
      name
      numEntrants
      slug
      startAt
      state
      type
      updatedAt
      videogame {
        id
        displayName
        name
        slug
      }
    }
  }
`)

const GET_EVENT_ENTRANTS = graphql(`
  query GetEventEntrants($slug: String, $page: Int, $perPage: Int) {
    event(slug: $slug) {
      entrants(query: { perPage: $perPage, page: $page }) {
        pageInfo {
          total
          totalPages
          page
          perPage
          sortBy
          filter
        }
        nodes {
          id
          name
          standing {
            placement
          }
        }
      }
    }
  }
`)

export function EventEntrants({
  slug = 'tournament/the-nightclub-s10e5-os-nyc/event/melee-singles',
  numEntrants,
  perPage = 10,
}: {
  slug?: string
  numEntrants: number
  perPage?: number
}) {
  return (
    <table>
      <thead>
        <tr>
          <th>id</th>
          <th>name</th>
          <th>placement</th>
        </tr>
      </thead>
      <tbody>
        {range(1, Math.ceil(numEntrants / perPage) + 1).map((page) => (
          <EventEntrantPage slug={slug} page={page} perPage={perPage} />
        ))}
      </tbody>
    </table>
  )
}

export function EventEntrantPage({
  slug,
  page,
  perPage = 10,
}: {
  slug: string
  page: number
  perPage: number
}) {
  const { loading, data } = useQuery(GET_EVENT_ENTRANTS, {
    variables: { slug, page, perPage },
  })
  return loading ? (
    <tr>
      <td>
        Loading event {slug} entrants page {page}
      </td>
    </tr>
  ) : (
    <>
      {data?.event?.entrants?.nodes?.map((entrant) => (
        <tr>
          <td>{entrant?.id}</td>
          <td>{entrant?.name}</td>
          <td>{entrant?.standing?.placement}</td>
        </tr>
      ))}
    </>
  )
}

export default function Event({ slug }: { slug: string }) {
  const { loading, data } = useQuery(GET_EVENT, {
    variables: { slug },
  })
  if (loading) {
    return <p>Loading event {slug}</p>
  }
  if (!data?.event) {
    return <pre>{JSON.stringify(data, null, 2)}</pre>
  }
  return (
    <dl>
      <dt>id</dt>
      <dd>{data.event.id}</dd>
      <dt>createdAt</dt>
      <dd>{data.event.createdAt}</dd>
      <dt>name</dt>
      <dd>{data.event.name}</dd>
      <dt>numEntrants</dt>
      <dd>{data.event.numEntrants}</dd>
      <dt>slug</dt>
      <dd>{data.event.slug}</dd>
      <dt>startAt</dt>
      <dd>{data.event.startAt}</dd>
      <dt>state</dt>
      <dd>{data.event.state}</dd>
      <dt>type</dt>
      <dd>{data.event.type}</dd>
      <dt>updatedAt</dt>
      <dd>{data.event.updatedAt}</dd>
      <dt>videogame</dt>
      <dd>
        <dl>
          <dt>id</dt>
          <dd>{data.event.videogame?.id}</dd>
          <dt>displayName</dt>
          <dd>{data.event.videogame?.displayName}</dd>
          <dt>name</dt>
          <dd>{data.event.videogame?.name}</dd>
          <dt>slug</dt>
          <dd>{data.event.videogame?.slug}</dd>
        </dl>
      </dd>
      <dt>entrants</dt>
      <dl>
        <EventEntrants slug={slug} numEntrants={data.event.numEntrants!} />
      </dl>
    </dl>
  )
}
