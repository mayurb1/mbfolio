import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import * as d3 from 'd3'

const Skills = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  const [activeChart, setActiveChart] = useState('bar')
  const barChartRef = useRef(null)
  const radarChartRef = useRef(null)

  const skillsData = [
    { name: 'React', level: 95, category: 'Frontend', color: '#61DAFB' },
    { name: 'JavaScript', level: 92, category: 'Language', color: '#F7DF1E' },
    { name: 'TypeScript', level: 88, category: 'Language', color: '#3178C6' },
    { name: 'Node.js', level: 85, category: 'Backend', color: '#339933' },
    { name: 'Python', level: 82, category: 'Language', color: '#3776AB' },
    { name: 'SQL', level: 78, category: 'Database', color: '#336791' },
    { name: 'AWS', level: 75, category: 'Cloud', color: '#FF9900' },
    { name: 'Docker', level: 72, category: 'DevOps', color: '#2496ED' },
    { name: 'GraphQL', level: 70, category: 'API', color: '#E10098' },
    { name: 'MongoDB', level: 68, category: 'Database', color: '#47A248' }
  ]

  const categories = {
    'Frontend': { color: '#3B82F6', skills: skillsData.filter(s => s.category === 'Frontend') },
    'Backend': { color: '#10B981', skills: skillsData.filter(s => s.category === 'Backend') },
    'Language': { color: '#8B5CF6', skills: skillsData.filter(s => s.category === 'Language') },
    'Database': { color: '#F59E0B', skills: skillsData.filter(s => s.category === 'Database') },
    'Cloud': { color: '#EF4444', skills: skillsData.filter(s => s.category === 'Cloud') },
    'DevOps': { color: '#06B6D4', skills: skillsData.filter(s => s.category === 'DevOps') },
    'API': { color: '#EC4899', skills: skillsData.filter(s => s.category === 'API') }
  }

  // Bar Chart with D3
  useEffect(() => {
    if (!inView || activeChart !== 'bar') return

    const svg = d3.select(barChartRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 30, bottom: 40, left: 100 }
    const width = 600 - margin.left - margin.right
    const height = 400 - margin.bottom - margin.top

    const chartGroup = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, width])

    const yScale = d3.scaleBand()
      .domain(skillsData.map(d => d.name))
      .range([0, height])
      .padding(0.1)

    // Color scale
    const colorScale = d3.scaleOrdinal()
      .domain(Object.keys(categories))
      .range(Object.values(categories).map(c => c.color))

    // Bars
    chartGroup.selectAll('.bar')
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
    chartGroup.selectAll('.label')
      .data(skillsData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', -10)
      .attr('y', d => yScale(d.name) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .style('fill', 'var(--color-text)')
      .style('font-size', '14px')
      .style('font-weight', '500')
      .text(d => d.name)
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .style('opacity', 1)

    // Percentage labels
    chartGroup.selectAll('.percentage')
      .data(skillsData)
      .enter()
      .append('text')
      .attr('class', 'percentage')
      .attr('x', d => xScale(d.level) + 10)
      .attr('y', d => yScale(d.name) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .style('fill', 'var(--color-text-secondary)')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .text(d => `${d.level}%`)
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100 + 500)
      .style('opacity', 1)

    // X-axis
    chartGroup.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickSize(-height).tickFormat(d => `${d}%`))
      .selectAll('line')
      .style('stroke', 'var(--color-border)')
      .style('stroke-dasharray', '3,3')

    chartGroup.select('.domain').style('stroke', 'var(--color-border)')
    chartGroup.selectAll('.tick text').style('fill', 'var(--color-text-secondary)')

  }, [inView, activeChart])

  // Radar Chart with D3
  useEffect(() => {
    if (!inView || activeChart !== 'radar') return

    const svg = d3.select(radarChartRef.current)
    svg.selectAll('*').remove()

    const width = 400
    const height = 400
    const radius = Math.min(width, height) / 2 - 40

    const chartGroup = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width/2},${height/2})`)

    // Category averages for radar chart
    const radarData = Object.entries(categories).map(([category, data]) => {
      const avgLevel = data.skills.reduce((sum, skill) => sum + skill.level, 0) / data.skills.length
      return { category, level: avgLevel, color: data.color }
    })

    const angleSlice = (Math.PI * 2) / radarData.length

    // Scales
    const rScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, radius])

    // Grid circles
    const levels = 5
    for (let i = 1; i <= levels; i++) {
      chartGroup.append('circle')
        .attr('r', radius * i / levels)
        .style('fill', 'none')
        .style('stroke', 'var(--color-border)')
        .style('stroke-width', 1)
        .style('stroke-dasharray', '3,3')
    }

    // Grid lines
    radarData.forEach((d, i) => {
      chartGroup.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', radius * Math.cos(angleSlice * i - Math.PI/2))
        .attr('y2', radius * Math.sin(angleSlice * i - Math.PI/2))
        .style('stroke', 'var(--color-border)')
        .style('stroke-width', 1)
    })

    // Data area
    const radarLine = d3.lineRadial()
      .angle((d, i) => angleSlice * i)
      .radius(d => rScale(d.level))
      .curve(d3.curveLinearClosed)

    chartGroup.append('path')
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
    chartGroup.selectAll('.radar-dot')
      .data(radarData)
      .enter()
      .append('circle')
      .attr('class', 'radar-dot')
      .attr('cx', (d, i) => rScale(d.level) * Math.cos(angleSlice * i - Math.PI/2))
      .attr('cy', (d, i) => rScale(d.level) * Math.sin(angleSlice * i - Math.PI/2))
      .attr('r', 0)
      .style('fill', d => d.color)
      .style('stroke', 'var(--color-background)')
      .style('stroke-width', 2)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 200)
      .attr('r', 6)

    // Labels
    chartGroup.selectAll('.radar-label')
      .data(radarData)
      .enter()
      .append('text')
      .attr('class', 'radar-label')
      .attr('x', (d, i) => (radius + 20) * Math.cos(angleSlice * i - Math.PI/2))
      .attr('y', (d, i) => (radius + 20) * Math.sin(angleSlice * i - Math.PI/2))
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .style('fill', 'var(--color-text)')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .text(d => d.category)
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .delay(1000)
      .style('opacity', 1)

  }, [inView, activeChart])

  return (
    <section 
      id="skills" 
      className="py-20 lg:py-32 bg-background"
      ref={ref}
    >
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

          {/* Chart Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center mb-12"
          >
            <div className="bg-surface border border-border rounded-lg p-1 flex">
              {[
                { id: 'bar', label: 'Bar Chart', icon: '📊' },
                { id: 'radar', label: 'Radar Chart', icon: '🕸️' }
              ].map((chart) => (
                <button
                  key={chart.id}
                  onClick={() => setActiveChart(chart.id)}
                  className={`px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2 ${
                    activeChart === chart.id
                      ? 'bg-primary text-background'
                      : 'text-text-secondary hover:text-text hover:bg-background'
                  }`}
                >
                  <span>{chart.icon}</span>
                  <span>{chart.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Charts Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-surface border border-border rounded-xl p-8 mb-12"
          >
            <div className="flex justify-center">
              {activeChart === 'bar' && (
                <svg ref={barChartRef} className="max-w-full h-auto" />
              )}
              {activeChart === 'radar' && (
                <svg ref={radarChartRef} className="max-w-full h-auto" />
              )}
            </div>
          </motion.div>

          {/* Skills Categories */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {Object.entries(categories).map(([category, data], index) => (
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
                  {data.skills.map((skill) => (
                    <div key={skill.name} className="flex items-center justify-between">
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

          {/* Additional Skills */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="mt-16 text-center"
          >
            <h3 className="text-xl font-semibold text-text mb-8">
              Additional Technologies & Tools
            </h3>
            
            <div className="flex flex-wrap justify-center gap-3">
              {[
                'Git', 'Webpack', 'Jest', 'Cypress', 'Figma', 'Adobe XD',
                'Linux', 'Nginx', 'Redis', 'PostgreSQL', 'Firebase', 'Vercel',
                'GitHub Actions', 'Terraform', 'Kubernetes', 'Jira'
              ].map((tech, index) => (
                <motion.span
                  key={tech}
                  className="px-4 py-2 bg-background border border-border rounded-full text-text-secondary text-sm hover:border-primary hover:text-primary transition-colors duration-200"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.3, delay: 1.2 + index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Skills