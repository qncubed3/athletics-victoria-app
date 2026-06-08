import { readFile } from 'fs/promises'
import path from 'path'
import type { CourseTrack } from './courseTrack'
import { ReplayPage } from './components/ReplayPage'

export default async function JellsRelaysReplayPage() {
  const filePath = path.join(process.cwd(), 'src/data/jells_park_2026.json')
  const course = JSON.parse(await readFile(filePath, 'utf-8')) as CourseTrack

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ReplayPage course={course} />
    </div>
  )
}
