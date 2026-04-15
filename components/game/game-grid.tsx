'use client'

import { GridCell as GridCellType, CellContent } from '@/lib/types'
import { GridCell } from './grid-cell'
import { cn } from '@/lib/utils'

type GameGridProps = {
  grid: GridCellType[][]
  highlightedCell?: { row: number; col: number } | null
  interactive?: boolean
  onCellClick?: (row: number, col: number) => void
  onCellDrop?: (row: number, col: number, element: CellContent) => void
  onCellRemove?: (row: number, col: number) => void
  showPositions?: boolean
  className?: string
}

export function GameGrid({
  grid,
  highlightedCell,
  interactive = false,
  onCellClick,
  onCellDrop,
  onCellRemove,
  showPositions = false,
  className,
}: GameGridProps) {
  const gridSize = grid.length

  return (
    <div className="relative">
      {/* Glow effect behind grid */}
      <div className="absolute inset-0 bg-primary/10 blur-xl rounded-3xl" />
      
      <div
        className={cn(
          'relative grid gap-2 md:gap-3 p-5 md:p-6 glass-card rounded-2xl',
          gridSize === 3 && 'grid-cols-3',
          gridSize === 4 && 'grid-cols-4',
          gridSize === 5 && 'grid-cols-5',
          className
        )}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <GridCell
              key={`${rowIndex}-${colIndex}`}
              content={cell.content}
              isHighlighted={
                highlightedCell?.row === rowIndex &&
                highlightedCell?.col === colIndex
              }
              interactive={interactive}
              onClick={
                onCellClick ? () => onCellClick(rowIndex, colIndex) : undefined
              }
              onDrop={
                onCellDrop
                  ? (element) => onCellDrop(rowIndex, colIndex, element)
                  : undefined
              }
              onRemove={
                onCellRemove
                  ? () => onCellRemove(rowIndex, colIndex)
                  : undefined
              }
              showPosition={showPositions}
              row={rowIndex}
              col={colIndex}
            />
          ))
        )}
      </div>
    </div>
  )
}
