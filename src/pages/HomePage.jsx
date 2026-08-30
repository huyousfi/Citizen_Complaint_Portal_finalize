import { Link } from 'react-router-dom'

const services = [
  { title: 'Complaint reporting', summary: 'Submit civic concerns quickly and clearly for faster action.', tags: ['Public issues', 'Reporting', 'Accessibility'] },
  { title: 'Status tracking', summary: 'Follow complaint progress from submission to resolution with transparency.', tags: ['Updates', 'Monitoring', 'Follow-up'] },
  { title: 'Department coordination', summary: 'Route issues to the right teams for accurate handling and accountability.', tags: ['Case workflow', 'Escalation', 'Oversight'] },
  { title: 'Community feedback', summary: 'Collect input that helps improve local services and public trust.', tags: ['Insights', 'Engagement', 'Improvements'] },
]

const projects = [
  { title: 'Road safety concern', type: 'Infrastructure · Public reporting', accent: 'early' },
  { title: 'Water supply issue', type: 'Utilities · Service follow-up', accent: 'mid' },
  { title: 'Waste management complaint', type: 'Sanitation · Review process', accent: 'late' },
]

const process = ['Report', 'Review', 'Assign', 'Resolve', 'Confirm outcome']

export default function HomePage() {
  return (
    <div className="husain-landing">
      <section className="husain-hero">
        <div className="hero-copy-wrap">
          <p className="eyebrow eyebrow--dark">CITIZEN COMPLAINT PORTAL</p>
          <h1>Public concerns,<br />clear action,<br />better services.</h1>
          <p className="hero-lead">
            Report service issues, track progress, and help improve the community through a transparent digital complaints system.
          </p>

          <div className="hero-actions">
            <Link to="/complaints/new" className="primary-button">Submit a complaint</Link>
            <Link to="/complaints" className="secondary-button">View complaints</Link>
          </div>
        </div>
      </section>

      <section className="home-strip">
        <span>Reporting</span>
        <span>Tracking</span>
        <span>Review</span>
        <span>Resolution</span>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <p className="eyebrow eyebrow--dark">What this portal does</p>
          <h2>Simple tools for safer, cleaner, better civic services.</h2>
        </div>

        <div className="service-grid">
          {services.map((service, index) => (
            <article key={service.title} className="service-card">
              <span className="service-number">0{index + 1}</span>
              <h3>{service.title}</h3>
              <p>{service.summary}</p>
              <div className="tag-row">
                {service.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <Link to="/complaints" className="inline-link">Learn more</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <p className="eyebrow eyebrow--dark">Common issues</p>
          <h2>Issues the public reports every day.</h2>
        </div>

        <div className="project-grid">
          {projects.map((project, index) => (
            <article key={project.title} className={`project-card project-card--${project.accent}`}>
              <span className="project-index">0{index + 1}</span>
              <div className="project-meta">
                <span>{project.type}</span>
              </div>
              <h3>{project.title}</h3>
              <Link to="/complaints" className="inline-link">Open project</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <p className="eyebrow eyebrow--dark">Public service examples</p>
          <h2>Built to help teams respond faster.</h2>
        </div>

        <div className="launch-grid">
          <div className="launch-card launch-card--primary">
            <span className="mini-tag">Infrastructure</span>
            <h3>Road maintenance request</h3>
            <p>Potholes, drainage, and street safety concerns reported by residents.</p>
          </div>
          <div className="launch-card">
            <span className="mini-tag">Utilities</span>
            <h3>Water and sanitation issue</h3>
            <p>Service interruptions and maintenance concerns tracked through one workflow.</p>
          </div>
          <div className="launch-card">
            <span className="mini-tag">Public services</span>
            <h3>Waste management complaint</h3>
            <p>Collection issues and neighborhood service concerns submitted for review.</p>
          </div>
        </div>
      </section>

      <section className="content-section process-section">
        <div className="section-heading">
          <p className="eyebrow eyebrow--dark">How it works</p>
          <h2>From report to resolution.</h2>
        </div>

        <div className="process-grid">
          {process.map((item, index) => (
            <article key={item} className="process-card">
              <span className="process-number">0{index + 1}</span>
              <h3>{item}</h3>
              <p>
                {index === 0 && 'The citizen submits a concern with the relevant details and location.'}
                {index === 1 && 'The report is reviewed for category, urgency, and required follow-up.'}
                {index === 2 && 'The right department or officer is assigned to handle the issue.'}
                {index === 3 && 'The team investigates, updates the status, and works toward resolution.'}
                {index === 4 && 'The final outcome is confirmed so the public can see that action was taken.'}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-panel">
        <div className="about-photo" aria-hidden="true" />
        <div className="about-copy">
          <p className="eyebrow eyebrow--dark">About the portal</p>
          <h2>Transparent public service starts with clear reporting.</h2>
          <p>
            This platform gives citizens a simple way to report service problems, track progress, and stay informed as issues move through review and resolution.
          </p>
          <div className="credentials-row">
            <span>Complaint intake</span>
            <span>Status updates</span>
            <span>Officer review</span>
            <span>Public accountability</span>
          </div>
          <Link to="/complaints" className="inline-link">Explore issues</Link>
        </div>
      </section>

      <section className="cta-panel section-space husain-cta">
        <div>
          <p className="eyebrow eyebrow--light">Need help?</p>
          <h2>Report the issue and let the right team review it with clear follow-up.</h2>
        </div>
        <Link to="/complaints/new" className="primary-button primary-button--light">Submit complaint</Link>
      </section>
    </div>
  )
}
