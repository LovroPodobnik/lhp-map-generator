import React, { useState, useCallback } from 'react'
import Papa from 'papaparse'
import LHPChart from './LHPChart'
import { motion, AnimatePresence } from 'framer-motion'

interface LHPData {
  ID: string
  'Habit Index1': string
  'Trust NPS 1': string
  'Created At1': string
  'Habit Index2': string
  'Trust NPS 2': string
  'Created At2': string
}

function App() {
  const [data, setData] = useState<LHPData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPreparing, setIsPreparing] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [showUploadedFiles, setShowUploadedFiles] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [showUploadedFilesInfo, setShowUploadedFilesInfo] = useState(false)
  const [currentFileName, setCurrentFileName] = useState<string>('')

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      setIsLoading(true)
      setShowUploadedFilesInfo(false)
      const fileArray = Array.from(files)
      const fileNames = fileArray.map((file) => file.name)
      setUploadedFiles((prevFiles) => [...prevFiles, ...fileNames])
      setCurrentFileName(fileNames[0])

      Promise.all(
        fileArray.map(
          (file) =>
            new Promise<LHPData[]>((resolve) => {
              Papa.parse<LHPData>(file, {
                complete: (results) => {
                  resolve(
                    results.data.filter(
                      (item) =>
                        item.ID &&
                        item['Habit Index1'] &&
                        item['Trust NPS 1'] &&
                        item['Habit Index2'] &&
                        item['Trust NPS 2']
                    )
                  )
                },
                header: true
              })
            })
        )
      ).then((results) => {
        const mergedData = results.flat()
        setIsLoading(false)
        setIsPreparing(true)
        setTimeout(() => {
          setData((prevData) => [...prevData, ...mergedData])
          setIsPreparing(false)
          setShowUploadedFilesInfo(true)
        }, 2000)
      })
    }
  }

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files) {
      handleFileUpload({
        target: { files }
      } as React.ChangeEvent<HTMLInputElement>)
    }
  }, [])

  return (
    <div
      className="min-h-screen bg-gray-50 p-4 sm:p-6"
      onDragEnter={handleDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <header className="mb-8 flex items-center">
        <div className="flex items-center">
          <svg
            className="size-6 text-[#3C3CE6]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h1 className="ml-2 text-lg font-medium text-gray-900">
            LHP Report Exporter
          </h1>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mt-16 max-w-md text-center"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-4 text-lg font-medium text-gray-700"
            >
              Uploading your files...
            </motion.p>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <motion.div
                className="absolute left-0 top-0 h-full bg-blue-500"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{
                  duration: 2,
                  ease: 'easeInOut',
                  repeat: Infinity
                }}
              />
              <motion.div
                className="absolute size-full bg-blue-300"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  duration: 1.5,
                  ease: 'linear',
                  repeat: Infinity
                }}
                style={{ filter: 'blur(8px)' }}
              />
            </div>
          </motion.div>
        ) : isPreparing ? (
          <motion.div
            key="preparing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mt-16 max-w-md text-center"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-4 text-lg font-medium text-gray-700"
            >
              Preparing your insights...
            </motion.p>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <motion.div
                className="absolute left-0 top-0 h-full bg-green-500"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{
                  duration: 2,
                  ease: 'easeInOut',
                  repeat: Infinity
                }}
              />
              <motion.div
                className="absolute size-full bg-green-300"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  duration: 1.5,
                  ease: 'linear',
                  repeat: Infinity
                }}
                style={{ filter: 'blur(8px)' }}
              />
            </div>
          </motion.div>
        ) : data.length === 0 ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-md"
          >
            <div
              className={`rounded-lg border-2 border-dashed p-8 text-center transition-all duration-300 ${
                isDragging
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDragEnter}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <svg
                className="mx-auto size-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mt-4 text-sm font-medium text-gray-900">
                Drag and drop your CSV file here, or
              </p>
              <label
                htmlFor="file-upload"
                className="mt-2 inline-flex cursor-pointer items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg
                  className="-ml-0.5 mr-2 size-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Select CSV
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".csv"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <p className="mt-2 text-xs text-gray-500">CSV files only</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="chart"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <LHPChart data={data} fileName={currentFileName} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUploadedFilesInfo && uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mt-4 text-sm text-gray-600"
          >
            <span className="font-semibold">{uploadedFiles.length}</span>{' '}
            file(s) uploaded
            <button
              onClick={() => setShowUploadedFiles(!showUploadedFiles)}
              className="ml-2 text-blue-500 hover:text-blue-600"
            >
              {showUploadedFiles ? 'Hide' : 'Show'}
            </button>
            {showUploadedFiles && (
              <ul className="mt-2 list-inside list-disc">
                {uploadedFiles.map((fileName, index) => (
                  <li key={index}>{fileName}</li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
