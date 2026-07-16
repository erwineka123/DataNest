import dayjs from 'dayjs'

export function formatDate(date) {
  return dayjs(date).format('DD MMM YYYY HH:mm')
}

export function formatRelative(date) {
  const now = dayjs()
  const target = dayjs(date)
  const minutes = now.diff(target, 'minute')

  if (minutes < 1) return 'Baru saja'
  if (minutes < 60) return `${minutes} menit lalu`

  const hours = now.diff(target, 'hour')
  if (hours < 24) return `${hours} jam lalu`

  const days = now.diff(target, 'day')
  if (days < 30) return `${days} hari lalu`

  return formatDate(date)
}
