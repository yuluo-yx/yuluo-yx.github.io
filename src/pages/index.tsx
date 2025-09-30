import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import BlogSection from '../components/landing/BlogSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import Hero from '../components/landing/Hero'
import ProjectSection from '../components/landing/ProjectSection'
import FloatingLights from '../components/magicui/floating-lights'

export default function Home() {
  const {
    siteConfig: { customFields, tagline },
  } = useDocusaurusContext()
  const { description } = customFields as { description: string }

  return (
    <Layout title={tagline} description={description}>
      <main>
        <Hero />
        <FloatingLights 
          quantity={30} 
          className="z-0" 
          colors={['#06b6d4', '#67e8f9', '#a7f3d0', '#e0f2fe']}
          minSize={1}
          maxSize={2.5}
          speed={0.2}
        />

        <div className="relative">
          <div className="mx-auto max-w-7xl bg-background lg:px-8">
            <BlogSection />
            <ProjectSection />
            <FeaturesSection />
          </div>
          <div
            className="absolute inset-0 -z-50 bg-grid-slate-50 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.3))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"
            style={{ backgroundPosition: '10px 10px;' }}
          />
        </div>
      </main>
    </Layout>
  )
}
