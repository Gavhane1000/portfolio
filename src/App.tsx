import { useEffect, useState } from 'react'
import { MotionConfig } from 'motion/react'
import { Nav } from './components/Nav'
import { Preloader } from './components/Preloader'
import { ChatLauncher, ChatPanel } from './components/ChatPanel'
import { Hero } from './sections/Hero'
import { About, Marquee } from './sections/About'
import { Work } from './sections/Work'
import { Architecture } from './sections/Architecture'
import { Experience } from './sections/Experience'
import { Recognition, Services } from './sections/Services'
import { Contact, Footer } from './sections/Contact'
import { initSmoothScroll } from './lib/smoothScroll'

export default function App() {
  const [ready, setReady] = useState(false)
  useEffect(() => initSmoothScroll(), [])

  return (
    <MotionConfig reducedMotion="user">
      <Preloader onDone={() => setReady(true)} />
      <div className="grain" aria-hidden />
      <Nav />
      <main className="[container-type:inline-size]">
        <Hero ready={ready} />
        <Marquee />
        <About />
        <Work />
        <Architecture />
        <Experience />
        <Services />
        <Recognition />
      </main>
      <div data-theme="dark" className="band mb-2 overflow-hidden [container-type:inline-size] md:mb-4">
        <Contact />
        <Footer />
      </div>
      <ChatPanel />
      <ChatLauncher />
    </MotionConfig>
  )
}
