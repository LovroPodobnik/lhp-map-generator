import React, { useState, useMemo } from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ScatterProps
} from 'recharts'

interface LHPData {
  ID: string
  'Habit Index1': string
  'Trust NPS 1': string
  'Created At1': string
  'Habit Index2': string
  'Trust NPS 2': string
  'Created At2': string
}

interface LHPChartProps {
  data: LHPData[]
  fileName: string // Add this prop to receive the file name
}

const LHPChart: React.FC<LHPChartProps> = ({ data, fileName }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const processedData = useMemo(
    () =>
      data.map((item) => ({
        id: item.ID,
        firstScan: {
          x: parseFloat(item['Habit Index1']),
          y: parseFloat(item['Trust NPS 1']),
          date: new Date(item['Created At1'])
        },
        latestScan: {
          x: parseFloat(item['Habit Index2']),
          y: parseFloat(item['Trust NPS 2']),
          date: new Date(item['Created At2'])
        }
      })),
    [data]
  )

  const { xDomain, xTicks, yTicks } = useMemo(() => {
    const xValues = processedData.flatMap((d) => [
      d.firstScan.x,
      d.latestScan.x
    ])
    const xMin = Math.floor(Math.min(...xValues))
    const xMax = Math.ceil(Math.max(...xValues))
    const xRange = xMax - xMin
    const xStep = Math.ceil(xRange / 5)

    const xDomain = [xMin, 100]
    const xTicks = []
    for (let i = xMin; i <= 100; i += xStep) {
      xTicks.push(Math.round(i))
    }
    if (xTicks[xTicks.length - 1] !== 100) {
      xTicks.push(100)
    }

    const yTicks = [0, 20, 40, 60, 80, 100]

    return { xDomain, xTicks, yTicks }
  }, [processedData])

  const CustomTooltip: React.FC<{
    active?: boolean
    payload?: Array<{
      name: string
      payload: { id: string; x: number; y: number; date: Date }
    }>
  }> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      setHoveredId(data.id)
      const isFirstScan = payload[0].name === 'First Scan'
      const otherScan = isFirstScan ? 'Latest Scan' : 'First Scan'
      const otherData = processedData.find((d) => d.id === data.id)
      const otherPoint = isFirstScan
        ? otherData?.latestScan
        : otherData?.firstScan

      return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
          <h3 className="mb-2 text-lg font-bold text-gray-800">{`ID: ${data.id}`}</h3>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="rounded bg-blue-100 p-3">
              <h4 className="mb-1 font-semibold text-blue-800">
                {payload[0].name}
              </h4>
              <p className="text-sm text-gray-600">
                Habit Index:{' '}
                <span className="font-medium text-gray-800">
                  {data.x.toFixed(2)}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Trust NPS:{' '}
                <span className="font-medium text-gray-800">
                  {data.y.toFixed(0)}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Date:{' '}
                <span className="font-medium text-gray-800">
                  {data.date.toLocaleDateString()}
                </span>
              </p>
            </div>
            {otherPoint && (
              <div className="rounded bg-green-100 p-3">
                <h4 className="mb-1 font-semibold text-green-800">
                  {otherScan}
                </h4>
                <p className="text-sm text-gray-600">
                  Habit Index:{' '}
                  <span className="font-medium text-gray-800">
                    {otherPoint.x.toFixed(2)}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Trust NPS:{' '}
                  <span className="font-medium text-gray-800">
                    {otherPoint.y.toFixed(0)}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Date:{' '}
                  <span className="font-medium text-gray-800">
                    {otherPoint.date.toLocaleDateString()}
                  </span>
                </p>
              </div>
            )}
          </div>
          {otherPoint && (
            <div className="mt-2 text-sm text-gray-600">
              <p>
                Habit Index Change:{' '}
                <span className="font-medium text-gray-800">
                  {(otherPoint.x - data.x).toFixed(2)}
                </span>
              </p>
              <p>
                Trust NPS Change:{' '}
                <span className="font-medium text-gray-800">
                  {(otherPoint.y - data.y).toFixed(0)}
                </span>
              </p>
            </div>
          )}
        </div>
      )
    }
    setHoveredId(null)
    return null
  }
  const CustomShape: React.FC<ScatterProps> = (props) => {
    const { cx, cy, fill, payload } = props as ScatterProps & {
      payload: { id: string }
    }
    const isHovered = hoveredId === payload.id
    return (
      <circle
        cx={cx}
        cy={cy}
        r={isHovered ? 10 : 8}
        fill={fill}
        stroke="#fff"
        strokeWidth={2}
        onMouseEnter={() => setHoveredId(payload.id)}
        onMouseLeave={() => setHoveredId(null)}
      />
    )
  }

  const downloadChartAsSVG = () => {
    setIsDownloading(true)
    const svgElement = document.querySelector('.recharts-wrapper svg')
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const svgBlob = new Blob([svgData], {
        type: 'image/svg+xml;charset=utf-8'
      })
      const svgUrl = URL.createObjectURL(svgBlob)
      const downloadLink = document.createElement('a')
      downloadLink.href = svgUrl
      downloadLink.download = 'lhp_chart.svg'
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      URL.revokeObjectURL(svgUrl)
      setTimeout(() => setIsDownloading(false), 1000) // Reset after 1 second
    } else {
      setIsDownloading(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div>
          <h2 className="text-lg font-medium text-gray-900">LHP Chart</h2>
          <p className="text-sm text-gray-500">
            Data from: {fileName} • {data.length} entries
          </p>
        </div>
        <button
          onClick={downloadChartAsSVG}
          disabled={isDownloading}
          className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isDownloading ? (
            <svg className="mr-1.5 size-4 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className="mr-1.5 size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          )}
          Download
        </button>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={600}>
          <ScatterChart
            margin={{
              top: 20,
              right: 20,
              bottom: 60, // Adjusted bottom margin
              left: 20
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E5E5"
              strokeOpacity={0.5}
            />
            <XAxis
              type="number"
              dataKey="x"
              name="Habit Index"
              domain={xDomain}
              ticks={xTicks}
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#E5E5E5' }}
              label={{
                value: 'Habit Index',
                position: 'bottom',
                offset: 0,
                style: { textAnchor: 'middle', fill: '#666', fontSize: 14 }
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Trust NPS"
              domain={[0, 100]}
              label={{
                value: 'Trust NPS',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#666', fontSize: 14 }
              }}
              ticks={yTicks}
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#E5E5E5' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value, entry) => (
                <span style={{ color: entry.color, fontWeight: 'bold' }}>
                  {value}
                </span>
              )}
            />

            {processedData.map((entry) => (
              <ReferenceLine
                key={`line-${entry.id}`}
                segment={[
                  { x: entry.firstScan.x, y: entry.firstScan.y },
                  { x: entry.latestScan.x, y: entry.latestScan.y }
                ]}
                stroke="#999999"
                strokeWidth={1}
                ifOverflow="visible"
                strokeOpacity={
                  hoveredId === null || hoveredId === entry.id ? 1 : 0.2
                }
              />
            ))}

            <Scatter
              name="First Scan"
              data={processedData.map((d) => ({ ...d.firstScan, id: d.id }))}
              fill="#FF6384"
              shape={<CustomShape />}
            />
            <Scatter
              name="Latest Scan"
              data={processedData.map((d) => ({ ...d.latestScan, id: d.id }))}
              fill="#36A2EB"
              shape={<CustomShape />}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default LHPChart
