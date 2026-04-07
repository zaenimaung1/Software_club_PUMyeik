/** Map MongoDB event document (from GET /api/events) to client event shape. */
export function mapEventFromApi(e) {
  return {
    id: String(e._id ?? e.id ?? ''),
    title: e.title ?? '',
    description: e.description ?? '',
    date: e.date ?? '',
    location: e.location ?? '',
  }
}
