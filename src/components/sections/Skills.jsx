import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import * as d3 from 'd3'

const Skills = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  const [activeChart, setActiveChart] = useState('bar')
  const [isPaused, setIsPaused] = useState(false)
  const barChartRef = useRef(null)
  const radarChartRef = useRef(null)
  const lineChartRef = useRef(null)
  const containerRef = useRef(null)

  const chartTypes = [
    {
      id: 'bar',
      label: 'Skills Overview',
      description: 'Individual skill proficiency levels',
    },
    {
      id: 'radar',
      label: 'Category Strengths',
      description: 'Skill distribution across domains',
    },
    {
      id: 'line',
      label: 'Growth Timeline',
      description: 'Skill development progression over time',
    },
  ]

  // Auto-rotate charts every 5 seconds
  useEffect(() => {
    if (!inView || isPaused) return

    const interval = setInterval(() => {
      setActiveChart(prev => {
        const currentIndex = chartTypes.findIndex(chart => chart.id === prev)
        const nextIndex = (currentIndex + 1) % chartTypes.length
        return chartTypes[nextIndex].id
      })
    }, 5000) // 5 seconds

    return () => clearInterval(interval)
  }, [inView, isPaused, chartTypes])

  const skillsData = [
    { name: 'React', level: 92, category: 'Frontend', color: '#61DAFB' },
    { name: 'JavaScript', level: 90, category: 'Language', color: '#F7DF1E' },
    { name: 'Redux', level: 85, category: 'Frontend', color: '#764ABC' },
    { name: 'Next.js', level: 80, category: 'Frontend', color: '#000000' },
    { name: 'HTML5', level: 88, category: 'Language', color: '#E34F26' },
    { name: 'CSS3', level: 86, category: 'Language', color: '#1572B6' },
    { name: 'Material UI', level: 84, category: 'Frontend', color: '#0288D1' },
    { name: 'Ant Design', level: 82, category: 'Frontend', color: '#1890FF' },
    { name: 'Tailwind CSS', level: 88, category: 'Frontend', color: '#06B6D4' },
    { name: 'Bootstrap', level: 80, category: 'Frontend', color: '#7952B3' },
    { name: 'Git', level: 85, category: 'DevOps', color: '#F05032' },
    { name: 'GitHub', level: 85, category: 'DevOps', color: '#333333' },
    { name: 'MongoDB', level: 78, category: 'Database', color: '#47A248' },
    { name: 'PostgreSQL', level: 75, category: 'Database', color: '#336791' },
  ]

  const categories = {
    Frontend: {
      color: '#3B82F6',
      skills: skillsData.filter(s => s.category === 'Frontend'),
    },
    Backend: {
      color: '#10B981',
      skills: skillsData.filter(s => s.category === 'Backend'),
    },
    Language: {
      color: '#8B5CF6',
      skills: skillsData.filter(s => s.category === 'Language'),
    },
    Database: {
      color: '#F59E0B',
      skills: skillsData.filter(s => s.category === 'Database'),
    },
    Cloud: {
      color: '#EF4444',
      skills: skillsData.filter(s => s.category === 'Cloud'),
    },
    DevOps: {
      color: '#06B6D4',
      skills: skillsData.filter(s => s.category === 'DevOps'),
    },
    API: {
      color: '#EC4899',
      skills: skillsData.filter(s => s.category === 'API'),
    },
  }

  // Responsive Bar Chart with D3
  useEffect(() => {
    if (!inView || activeChart !== 'bar' || !containerRef.current) return

    const svg = d3.select(barChartRef.current)
    svg.selectAll('*').remove()

    // Responsive dimensions based on container
    const containerWidth = containerRef.current.offsetWidth
    const isMobile = window.innerWidth < 768
    const isTablet = window.innerWidth < 1024

    const margin = isMobile
      ? { top: 20, right: 20, bottom: 40, left: 80 }
      : { top: 20, right: 30, bottom: 40, left: 100 }

    const maxWidth = Math.min(
      containerWidth - 40,
      isMobile ? 400 : isTablet ? 420 : 350
    )
    const width = maxWidth - margin.left - margin.right
    const height = isMobile ? 280 : isTablet ? 300 : 250
    const chartHeight = height - margin.top - margin.bottom

    const chartGroup = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Scales
    const xScale = d3.scaleLinear().domain([0, 100]).range([0, width])

    const yScale = d3
      .scaleBand()
      .domain(skillsData.map(d => d.name))
      .range([0, chartHeight])
      .padding(0.1)

    // Color scale
    const colorScale = d3
      .scaleOrdinal()
      .domain(Object.keys(categories))
      .range(Object.values(categories).map(c => c.color))

    // Bars
    chartGroup
      .selectAll('.bar')
      .data(skillsData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => yScale(d.name))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.category))
      .attr('rx', 4)
      .attr('width', 0)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr('width', d => xScale(d.level))

    // Labels
    chartGroup
      .selectAll('.label')
      .data(skillsData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', -10)
      .attr('y', d => yScale(d.name) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .style('fill', 'var(--color-text)')
      .style('font-size', isMobile ? '12px' : '14px')
      .style('font-weight', '500')
      .text(d => d.name)
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .style('opacity', 1)

    // Percentage labels
    chartGroup
      .selectAll('.percentage')
      .data(skillsData)
      .enter()
      .append('text')
      .attr('class', 'percentage')
      .attr('x', d => xScale(d.level) + (isMobile ? 5 : 10))
      .attr('y', d => yScale(d.name) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .style('fill', 'var(--color-text-secondary)')
      .style('font-size', isMobile ? '10px' : '12px')
      .style('font-weight', '600')
      .text(d => `${d.level}%`)
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100 + 500)
      .style('opacity', 1)

    // X-axis
    chartGroup
      .append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(-chartHeight)
          .tickFormat(d => `${d}%`)
      )
      .selectAll('line')
      .style('stroke', 'var(--color-border)')
      .style('stroke-dasharray', '3,3')

    chartGroup.select('.domain').style('stroke', 'var(--color-border)')
    chartGroup
      .selectAll('.tick text')
      .style('fill', 'var(--color-text-secondary)')
      .style('font-size', isMobile ? '10px' : '12px')
  }, [inView, activeChart, categories, skillsData])

  // Responsive Radar Chart with D3
  useEffect(() => {
    if (!inView || activeChart !== 'radar' || !containerRef.current) return

    const svg = d3.select(radarChartRef.current)
    svg.selectAll('*').remove()

    // Responsive dimensions
    const containerWidth = containerRef.current.offsetWidth
    const isMobile = window.innerWidth < 768
    const size = Math.min(containerWidth - 40, isMobile ? 260 : 280)
    const radius = size / 2 - (isMobile ? 30 : 40)

    const chartGroup = svg
      .attr('width', size)
      .attr('height', size)
      .attr('viewBox', `0 0 ${size} ${size}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${size / 2},${size / 2})`)

    // Category averages for radar chart
    const radarData = Object.entries(categories)
      .filter(([_category, data]) => data.skills && data.skills.length > 0)
      .map(([category, data]) => {
        const avgLevel =
          data.skills.reduce((sum, skill) => sum + skill.level, 0) /
          data.skills.length
        return { category, level: avgLevel, color: data.color }
      })

    const angleSlice = (Math.PI * 2) / radarData.length

    // Scales
    const rScale = d3.scaleLinear().domain([0, 100]).range([0, radius])

    // Grid circles
    const levels = 5
    for (let i = 1; i <= levels; i++) {
      chartGroup
        .append('circle')
        .attr('r', (radius * i) / levels)
        .style('fill', 'none')
        .style('stroke', 'var(--color-border)')
        .style('stroke-width', 1)
        .style('stroke-dasharray', '3,3')
    }

    // Grid lines
    radarData.forEach((d, i) => {
      chartGroup
        .append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', radius * Math.cos(angleSlice * i - Math.PI / 2))
        .attr('y2', radius * Math.sin(angleSlice * i - Math.PI / 2))
        .style('stroke', 'var(--color-border)')
        .style('stroke-width', 1)
    })

    // Data area
    const radarLine = d3
      .lineRadial()
      .angle((d, i) => angleSlice * i)
      .radius(d => rScale(d.level))
      .curve(d3.curveLinearClosed)

    chartGroup
      .append('path')
      .datum(radarData)
      .attr('d', radarLine)
      .style('fill', 'var(--color-primary)')
      .style('fill-opacity', 0.1)
      .style('stroke', 'var(--color-primary)')
      .style('stroke-width', 2)
      .style('stroke-dasharray', '1000')
      .style('stroke-dashoffset', '1000')
      .transition()
      .duration(2000)
      .style('stroke-dashoffset', '0')

    // Data points
    chartGroup
      .selectAll('.radar-dot')
      .data(radarData)
      .enter()
      .append('circle')
      .attr('class', 'radar-dot')
      .attr(
        'cx',
        (d, i) => rScale(d.level) * Math.cos(angleSlice * i - Math.PI / 2)
      )
      .attr(
        'cy',
        (d, i) => rScale(d.level) * Math.sin(angleSlice * i - Math.PI / 2)
      )
      .attr('r', 0)
      .style('fill', d => d.color)
      .style('stroke', 'var(--color-background)')
      .style('stroke-width', 2)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 200)
      .attr('r', isMobile ? 4 : 6)

    // Labels
    chartGroup
      .selectAll('.radar-label')
      .data(radarData)
      .enter()
      .append('text')
      .attr('class', 'radar-label')
      .attr(
        'x',
        (d, i) =>
          (radius + (isMobile ? 15 : 20)) *
          Math.cos(angleSlice * i - Math.PI / 2)
      )
      .attr(
        'y',
        (d, i) =>
          (radius + (isMobile ? 15 : 20)) *
          Math.sin(angleSlice * i - Math.PI / 2)
      )
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .style('fill', 'var(--color-text)')
      .style('font-size', isMobile ? '11px' : '14px')
      .style('font-weight', '600')
      .text(d => d.category)
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .delay(1000)
      .style('opacity', 1)
  }, [inView, activeChart, categories])

  // Responsive Line Chart with D3 - Skills Growth Over Time
  useEffect(() => {
    if (!inView || activeChart !== 'line' || !containerRef.current) return

    const svg = d3.select(lineChartRef.current)
    svg.selectAll('*').remove()

    // Responsive dimensions
    const containerWidth = containerRef.current.offsetWidth
    const isMobile = window.innerWidth < 768
    const isTablet = window.innerWidth < 1024
    const margin = isMobile
      ? { top: 20, right: 20, bottom: 40, left: 60 }
      : { top: 20, right: 30, bottom: 40, left: 80 }

    const maxWidth = Math.min(
      containerWidth - 40,
      isMobile ? 400 : isTablet ? 420 : 380
    )
    const width = maxWidth - margin.left - margin.right
    const height = isMobile ? 260 : isTablet ? 280 : 260
    const chartHeight = height - margin.top - margin.bottom

    // Mock data for skill progression over years
    const timelineData = [
      {
        year: 2020,
        Frontend: 60,
        Backend: 45,
        Language: 70,
        Database: 40,
        DevOps: 30,
        Cloud: 25,
      },
      {
        year: 2021,
        Frontend: 75,
        Backend: 60,
        Language: 80,
        Database: 55,
        DevOps: 45,
        Cloud: 40,
      },
      {
        year: 2022,
        Frontend: 85,
        Backend: 75,
        Language: 88,
        Database: 70,
        DevOps: 60,
        Cloud: 55,
      },
      {
        year: 2023,
        Frontend: 92,
        Backend: 85,
        Language: 92,
        Database: 80,
        DevOps: 75,
        Cloud: 70,
      },
      {
        year: 2024,
        Frontend: 95,
        Backend: 90,
        Language: 95,
        Database: 85,
        DevOps: 82,
        Cloud: 78,
      },
    ]

    const chartGroup = svg
      .attr('width', maxWidth)
      .attr('height', height)
      .attr('viewBox', `0 0 ${maxWidth} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(timelineData, d => d.year))
      .range([0, width])

    const yScale = d3.scaleLinear().domain([0, 100]).range([chartHeight, 0])

    // Line generator
    const line = d3
      .line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX)

    // Create lines for each category
    Object.entries(categories).forEach(([category, categoryInfo], index) => {
      const categoryData = timelineData.map(d => ({
        year: d.year,
        value: d[category] || 0,
      }))

      // Draw line
      const path = chartGroup
        .append('path')
        .datum(categoryData)
        .attr('fill', 'none')
        .attr('stroke', categoryInfo.color)
        .attr('stroke-width', 2.5)
        .attr('d', line)
        .style('opacity', 0.8)

      // Animate line drawing
      const totalLength = path.node().getTotalLength()
      path
        .attr('stroke-dasharray', totalLength + ' ' + totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(2000)
        .delay(index * 300)
        .attr('stroke-dashoffset', 0)

      // Add dots
      chartGroup
        .selectAll(`.dot-${category}`)
        .data(categoryData)
        .enter()
        .append('circle')
        .attr('class', `dot-${category}`)
        .attr('cx', d => xScale(d.year))
        .attr('cy', d => yScale(d.value))
        .attr('r', 0)
        .attr('fill', categoryInfo.color)
        .attr('stroke', 'var(--color-background)')
        .attr('stroke-width', 2)
        .transition()
        .duration(500)
        .delay(index * 300 + 2000)
        .attr('r', isMobile ? 3 : 4)
    })

    // X-axis
    chartGroup
      .append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('d')))
      .style('color', 'var(--color-text-secondary)')
      .style('font-size', isMobile ? '10px' : '12px')

    // Y-axis
    chartGroup
      .append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => `${d}%`))
      .style('color', 'var(--color-text-secondary)')
      .style('font-size', isMobile ? '10px' : '12px')

    // Grid lines
    chartGroup
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).tickSize(-chartHeight).tickFormat(''))
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3)

    chartGroup
      .append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(''))
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3)

    // Legend
    const legend = chartGroup
      .append('g')
      .attr('transform', `translate(${isMobile ? 10 : 20}, 10)`)

    Object.entries(categories).forEach(([category, categoryInfo], index) => {
      const legendRow = legend
        .append('g')
        .attr('transform', `translate(0, ${index * (isMobile ? 16 : 18)})`)

      legendRow
        .append('circle')
        .attr('r', isMobile ? 3 : 4)
        .attr('fill', categoryInfo.color)
        .style('opacity', 0)
        .transition()
        .duration(500)
        .delay(3000 + index * 100)
        .style('opacity', 1)

      legendRow
        .append('text')
        .attr('x', isMobile ? 8 : 10)
        .attr('y', 0)
        .attr('dy', '0.35em')
        .style('font-size', isMobile ? '10px' : '12px')
        .style('fill', 'var(--color-text-secondary)')
        .text(category)
        .style('opacity', 0)
        .transition()
        .duration(500)
        .delay(3000 + index * 100)
        .style('opacity', 1)
    })
  }, [inView, activeChart, categories])

  return (
    <section id="skills" className="py-20 lg:py-32 bg-background" ref={ref}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-text mb-4">
              Skills & Expertise
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              A comprehensive overview of my technical capabilities
            </p>
          </motion.div>

          {/* Chart Info Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-8"
          >
            <motion.div
              key={activeChart}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-center">
                <h3 className="text-xl font-semibold text-text">
                  {chartTypes.find(chart => chart.id === activeChart)?.label}
                </h3>
              </div>
              <p className="text-text-secondary text-sm">
                {
                  chartTypes.find(chart => chart.id === activeChart)
                    ?.description
                }
              </p>
            </motion.div>
          </motion.div>

          {/* Chart Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex justify-center space-x-2 mb-8"
          >
            {chartTypes.map((chart, _index) => (
              <motion.button
                key={chart.id}
                onClick={() => {
                  setActiveChart(chart.id)
                  setIsPaused(true)
                  setTimeout(() => setIsPaused(false), 10000) // Resume after 10s
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeChart === chart.id
                    ? 'bg-primary w-8'
                    : 'bg-border hover:bg-text-secondary'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </motion.div>

          {/* Charts Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-surface border border-border rounded-xl p-6 sm:p-8 mb-12 overflow-hidden relative"
            ref={containerRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Pause indicator */}
            {isPaused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-4 right-4 text-text-secondary text-xs flex items-center space-x-1"
              >
                <div className="w-1 h-3 bg-text-secondary rounded-full"></div>
                <div className="w-1 h-3 bg-text-secondary rounded-full"></div>
                <span>Paused</span>
              </motion.div>
            )}

            <div className="flex justify-center items-center min-h-[280px] sm:min-h-[300px]">
              <motion.div
                key={activeChart}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6 }}
              >
                {activeChart === 'bar' && (
                  <svg
                    ref={barChartRef}
                    className="h-auto"
                    style={{ maxWidth: '400px', width: 'auto' }}
                  />
                )}
                {activeChart === 'radar' && (
                  <svg
                    ref={radarChartRef}
                    className="h-auto"
                    style={{ maxWidth: '300px', width: 'auto' }}
                  />
                )}
                {activeChart === 'line' && (
                  <svg
                    ref={lineChartRef}
                    className="h-auto"
                    style={{ maxWidth: '400px', width: 'auto' }}
                  />
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Skills Categories */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {Object.entries(categories)
              .filter(
                ([_category, data]) => data.skills && data.skills.length > 0
              )
              .map(([category, data], index) => (
                <motion.div
                  key={category}
                  className="bg-surface border border-border rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center mb-4">
                    <div
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: data.color }}
                    />
                    <h3 className="text-lg font-semibold text-text">
                      {category}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {data.skills.map(skill => (
                      <div
                        key={skill.name}
                        className="flex items-center justify-between"
                      >
                        <span className="text-text-secondary text-sm">
                          {skill.name}
                        </span>
                        <span className="text-text font-medium text-sm">
                          {skill.level}%
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Skills
