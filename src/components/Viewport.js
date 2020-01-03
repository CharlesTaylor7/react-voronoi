import React, { useState, useCallback, useEffect } from 'react'
import './Viewport.css'
import useResizeAware from 'react-resize-aware'
import { Parabola } from './svg/Parabola'
import { Site } from './svg/Site'
import { parabolaBezier } from '../utilities/parabola'
import { Tooltip } from './Tooltip'
import getOffsetFromCurrentTarget from '../utilities/getOffsetFromCurrentTarget'
import { Sweepline } from './svg/Sweepline'

export const Viewport = () => {
  const [ viewportSizeListener, viewportSize ] = useResizeAware();
  const [ cursor, setCursor ] = useState(null);
  const [ sites, setSites ] = useState([]);
  const [index, setIndex] = useState(-1);
  useEffect(() => {
    document.onkeydown = (e) => {
      if (e.key === 'ArrowLeft') {
        if (sites[index - 1]) {
          setIndex(index - 1);
          setSweeplineX(sites[index - 1].x)
        }
      }
      else if (e.key === 'ArrowRight') {
        if (sites[index + 1]) {
          setIndex(index + 1);
          setSweeplineX(sites[index + 1].x)
        }
      }
    }
  }, [index, setIndex, sites])

  const onClick = useCallback(
    event => {
      const site = getOffsetFromCurrentTarget(event);
      setSites(ns => [...ns, site]);
    },
    []
  );

  const [sweeplineX, setSweeplineX] = useState(200);
  const [sweeplineDragging, setSweeplineDragging] = useState(false);
  const onClickSweepline = useCallback(
    event => {
      event.stopPropagation();
      setSweeplineDragging(!sweeplineDragging);
    },
    [sweeplineDragging, setSweeplineDragging]
  );

  const onMouseMove = useCallback(
    event => {
      const offset = getOffsetFromCurrentTarget(event);
      if (sweeplineDragging) {
        setSweeplineX(offset.x);
      }
      setCursor(offset);
    },
    [sweeplineDragging, setCursor, setSweeplineX]
  );
  const onMouseLeave = useCallback(() => setCursor(null), []);

  return (
    <div
      className="viewport"
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {viewportSizeListener}
      {cursor
        ? <Tooltip cursor={cursor} viewportSize={viewportSize} sweeplineDragging={sweeplineDragging}/>
        : null
      }
      <svg
        className="svg"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <Sweepline
          x={sweeplineX}
          onClick={onClickSweepline}
          height={viewportSize.height}
          selected={sweeplineDragging}
        />
        {sites.map((site, i) =>
          <Site
            key={i}
            {...site}
          />
        )}
        {sites.map((focus, i) =>
          <Parabola
            key={i}
            {...parabolaBezier({
              focus,
              directrix: sweeplineX,
              y_range: [0, viewportSize.height],
            })}
          />
        )}

      </svg>
    </div>
  )
}
