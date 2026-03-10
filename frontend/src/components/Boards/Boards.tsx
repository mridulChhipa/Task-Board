import { useState } from 'react';
import styles from './boards.module.css'; // or your CSS file
import type { Board } from '../../types/project.types';

interface Props {
  boards: Board[];
}

export default function Boards({ boards }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeBoard = boards[activeIndex];

  return (
    <div className={styles.container}>
      <div className={styles.tabList} role="tablist">
        {boards.map((board, idx) => {
          const isActive = idx === activeIndex;

          return (
            <button
              key={board.id ?? idx}
              type="button"
              role="tab"
              tabIndex={isActive ? 0 : -1}
              aria-selected={isActive}
              aria-controls={`board-panel-${idx}`}
              id={`board-tab-${idx}`}
              className={`${styles.tab} ${isActive ? styles.active : ''}`}
              onClick={() => setActiveIndex(idx)}
            >
              {board.name}
            </button>
          );
        })}
      </div>

      {activeBoard && (
        <div
          role="tabpanel"
          id={`board-panel-${activeIndex}`}
          aria-labelledby={`board-tab-${activeIndex}`}
          className={styles.panel}
        >
          <div className={styles.placeholder}>
            <h2>{activeBoard.name}</h2>
            <p>Board content goes here...</p>
          </div>
        </div>
      )}
    </div>
  );
}
