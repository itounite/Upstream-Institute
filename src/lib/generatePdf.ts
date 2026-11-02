import { jsPDF } from 'jspdf'

export interface WhitePaperPdfOptions {
  onProgress?: (status: string) => void
}

interface LoadedImage {
  dataUrl: string
  width: number
  height: number
}

/**
 * Loads an image (PNG, JPG, WebP) via an off-screen canvas and returns
 * a standard PNG data URL with its natural dimensions.
 */
function loadPngData(src: string): Promise<LoadedImage | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null)
      return
    }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const nw = img.naturalWidth || img.width || 800
        const nh = img.naturalHeight || img.height || 600
        canvas.width = nw
        canvas.height = nh
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(null)
          return
        }
        ctx.drawImage(img, 0, 0)
        resolve({
          dataUrl: canvas.toDataURL('image/png'),
          width: nw,
          height: nh,
        })
      } catch (err) {
        console.warn('Canvas export failed for:', src, err)
        resolve(null)
      }
    }
    img.onerror = () => {
      console.warn('Image failed to load:', src)
      resolve(null)
    }
    img.src = src
  })
}

/**
 * Loads an image and clips it to a perfect circle for author portraits.
 */
function loadCircularAvatar(src: string, size = 180): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null)
      return
    }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(null)
          return
        }
        ctx.beginPath()
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()

        const nw = img.naturalWidth || img.width
        const nh = img.naturalHeight || img.height
        const minDim = Math.min(nw, nh)
        const sx = (nw - minDim) / 2
        const sy = (nh - minDim) / 2
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size)
        resolve(canvas.toDataURL('image/png'))
      } catch {
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = src
  })
}

export async function generateWhitePaperPdf(options?: WhitePaperPdfOptions): Promise<void> {
  const { onProgress } = options || {}
  onProgress?.('Loading diagrams & portraits...')

  // Pre-load all 10 diagrams, 3 physical space photos, and author portraits concurrently
  const [
    chartThought,
    chartAgency,
    chartDivorce,
    chartInstitutions,
    chartEsg,
    chartThreeLegs,
    chartLeg1,
    chartLeg2,
    chartLeg3,
    chartCausal,
    chartSpatial,
    photoEstate,
    photoDialogueSalon,
    photoStudio,
    avatarSagar,
    avatarPaavo,
    avatarElina,
  ] = await Promise.all([
    loadPngData('/charts/thought-starting-point.png'),
    loadPngData('/charts/losing-agency.png'),
    loadPngData('/charts/great-divorce.png'),
    loadPngData('/charts/institutions-fail.png'),
    loadPngData('/charts/esg-lip-service.png'),
    loadPngData('/charts/three-legs.png'),
    loadPngData('/charts/leg1-think-dialogue.png'),
    loadPngData('/charts/leg2-social-policy.png'),
    loadPngData('/charts/leg3-capital-deployment.png'),
    loadPngData('/charts/causal-chain.png'),
    loadPngData('/assets/aistudio/Spatial_layout_b50cf1a8.png'),
    loadPngData('/assets/aistudio/27_Ilmakuva_talo_ja_jarvi_36164b51.jpg'),
    loadPngData('/assets/aistudio/5_Olohuone_c5ff14de.jpg'),
    loadPngData('/assets/aistudio/23_Studio_6e886580.jpg'),
    loadCircularAvatar('/assets/aistudio/ST_-_Black_Japan_6033a488.png', 180),
    loadCircularAvatar('/assets/aistudio/Paavo_02c44543.webp', 180),
    loadCircularAvatar('/assets/aistudio/Elina_49532e99.webp', 180),
  ])

  onProgress?.('Formatting PDF document...')

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let y = margin

  const addRunningHeader = () => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(130, 130, 130)
    doc.text('UPSTREAM INSTITUTE', margin, 12)
    doc.text('WHITE PAPER', pageWidth - margin, 12, { align: 'right' })
    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.2)
    doc.line(margin, 14, pageWidth - margin, 14)
  }

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage()
      y = margin
      addRunningHeader()
    }
  }

  /* ────────── COVER / TITLE SECTION ────────── */
  y = 32

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(110, 110, 110)
  doc.text('THINK UPSTREAM', margin, y)
  y += 7

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.setTextColor(20, 20, 20)
  const titleLines = doc.splitTextToSize('Where Do Thoughts Come From?', contentWidth)
  doc.text(titleLines, margin, y)
  y += titleLines.length * 9.5 + 2

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(70, 70, 70)
  const subLines = doc.splitTextToSize(
    'A New School of Thought for Finance, Policy, Planetary Regeneration, Science, and Technology',
    contentWidth
  )
  doc.text(subLines, margin, y)
  y += subLines.length * 5.5 + 4

  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.4)
  doc.line(margin, y, pageWidth - margin, y)
  y += 7

  // Authors with circular portraits and email IDs in the header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text('AUTHORS', margin, y)
  y += 6

  const authorThumbSize = 11 // mm
  const authorSpacing = (contentWidth - authorThumbSize * 3) / 3

  const headerAuthors = [
    { name: 'Sagar Tandon', email: 's@threadsunite.xyz', avatar: avatarSagar },
    { name: 'Paavo Pylkkanen', email: 'paavo.pylkkanen@helsinki.fi', avatar: avatarPaavo },
    { name: 'Elina Pylkkanen', email: 'ElinaAP@proton.me', avatar: avatarElina },
  ]

  let curAuthX = margin
  headerAuthors.forEach((auth) => {
    if (auth.avatar) {
      doc.addImage(auth.avatar, 'PNG', curAuthX, y - 1, authorThumbSize, authorThumbSize, undefined, 'FAST')
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(30, 30, 30)
    doc.text(auth.name, curAuthX + authorThumbSize + 2.5, y + 3.5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(110, 110, 110)
    doc.text(auth.email, curAuthX + authorThumbSize + 2.5, y + 8)

    curAuthX += authorSpacing + authorThumbSize
  })

  y += authorThumbSize + 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(120, 120, 120)
  doc.text('Helsinki, Finland', margin, y)
  y += 12

  /* ────────── HELPER FOR CONTENT ────────── */
  const addHeading = (title: string) => {
    checkPageBreak(20)
    y += 5
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13.5)
    doc.setTextColor(25, 25, 25)
    doc.text(title, margin, y)
    y += 7
  }

  const addSubHeading = (title: string) => {
    checkPageBreak(14)
    y += 3
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(45, 45, 45)
    doc.text(title, margin, y)
    y += 6
  }

  const addParagraph = (text: string) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(50, 50, 50)
    const lines = doc.splitTextToSize(text, contentWidth)
    const paragraphHeight = lines.length * 5.2
    checkPageBreak(paragraphHeight + 3)
    doc.text(lines, margin, y)
    y += paragraphHeight + 4
  }

  const addBlockquote = (quote: string, cite?: string) => {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9.5)
    doc.setTextColor(70, 70, 70)
    const quoteWidth = contentWidth - 10
    const lines = doc.splitTextToSize(`"${quote}"`, quoteWidth)
    const quoteHeight = lines.length * 5.2 + (cite ? 6 : 0)
    checkPageBreak(quoteHeight + 6)

    doc.setDrawColor(180, 180, 180)
    doc.setLineWidth(0.8)
    doc.line(margin + 2, y - 2, margin + 2, y + quoteHeight - 2)

    doc.text(lines, margin + 8, y)
    y += lines.length * 5.2

    if (cite) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(120, 120, 120)
      doc.text(`— ${cite}`, margin + 8, y + 2)
      y += 6
    }
    y += 4
  }

  const addBullet = (boldPrefix: string, text: string) => {
    checkPageBreak(8)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(50, 50, 50)
    const bulletText = boldPrefix ? `${boldPrefix}: ${text}` : text
    const lines = doc.splitTextToSize(bulletText, contentWidth - 6)
    const height = lines.length * 5
    checkPageBreak(height + 2)

    doc.circle(margin + 2, y - 1, 0.8, 'F')
    doc.text(lines, margin + 6, y)
    y += height + 2
  }

  const addChart = (img: LoadedImage | null, caption?: string, maxW = contentWidth) => {
    if (!img) return
    const targetW = Math.min(contentWidth, maxW)
    const targetH = (img.height / img.width) * targetW

    const maxPrintH = pageHeight - margin * 2 - 22
    let renderW = targetW
    let renderH = targetH
    if (renderH > maxPrintH) {
      renderH = maxPrintH
      renderW = (img.width / img.height) * renderH
    }

    const extraSpace = caption ? 10 : 6
    checkPageBreak(renderH + extraSpace)

    const renderX = margin + (contentWidth - renderW) / 2
    doc.addImage(img.dataUrl, 'PNG', renderX, y, renderW, renderH, undefined, 'FAST')
    y += renderH + 3

    if (caption) {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(8)
      doc.setTextColor(130, 130, 130)
      doc.text(caption, pageWidth / 2, y + 1.5, { align: 'center' })
      y += 5
    }
    y += 4
  }

  /* ────────── SECTION 1: Where Do Thoughts Come From? ────────── */
  addHeading('1. Where Do Thoughts Come From?')
  addChart(chartThought, 'Thought as the Starting Point')
  addParagraph(
    'Where do thoughts come from? How do thoughts define the physical world we live in? Do we even think critically about our thoughts before jumping on the bandwagon to research basic sciences, innovate, create, and scale technologies, or even finance the sciences and technologies and seek returns from that?'
  )
  addParagraph('As David Bohm eloquently put it:')
  addBlockquote(
    'Thought is the ultimate origin or source; if we don\'t do anything about thought, we won\'t get anywhere. We may momentarily relieve the population problem, the ecological problem, and so on, but they will come back in another way.',
    'David Bohm'
  )
  addParagraph(
    'Thought is the starting point; if we put thought out of the window while trying to do research, innovate, or create something, we are not really going beyond the thought that is already embedded in our conscious/unconscious mind, and that affects everything; hence, the abstractions we get out of the thoughts will be affected, and hence overall perception will be affected too.'
  )

  /* ────────── SECTION 2: Losing Agency of Thought ────────── */
  addHeading('2. Losing Agency of Thought')
  addChart(chartAgency, 'Losing Agency of Thought')
  addParagraph(
    'With the advent of mindless scrolling because of social media, dopamine hits and instant gratification from LLMs, agents, and chatbots are numbing us; it is slowing the thinking process but most importantly it is damaging our thoughts to even refresh or reboot, and challenge the assumptions of our own thoughts and start a thought process from scratch.'
  )
  addParagraph(
    'We are slowly handing over agency of thought to the machine, in the name of artificial intelligence, that is still nothing but 0s and 1s, a black box to recognize patterns to spit out a cohesive-sounding sentence, but it is not thought, and if it is not, worth contemplating on as it misses the human ingenuity. The discoveries are not made on just some data and previous thoughts, but breakthroughs come to life when we can push boundaries of thought.'
  )

  /* ────────── SECTION 3: The Finance Disconnect ────────── */
  addHeading('3. The Finance Disconnect')
  addChart(chartDivorce, 'The Great Divorce: Decoupling of Capital from the Real Economy')
  addParagraph(
    'The world of finance that I come from is not just a passive culprit, but actively involved in destroying the very essence of human principles, not because it is inherently evil, but rather because of the thought, or the lack of challenging, the status quo. Several assumptions about the current form of finance and capitalism are purely based on the opinions of neo-liberal economists like Milton Friedman, which have been overly amplified and adopted without knowing the facts or challenging the thoughts not just enough, but not at all, and that is the core issue, which has rotten the field of finance.'
  )
  addParagraph(
    'With time, it has become more and more disconnected from the real world and the reality that humans live in and where nature exists. Think tanks have become key in propagating a certain way of thinking, and it affects not just policymakers and capitalists but also ordinary people; it is so deeply entrenched now that we have lost the ability to think. From quantum computers to basic science, innovation and technological advancement have loosened our grip on thinking; as a result, we haphazardly fund abstractions, which shapes our worldview of the real world and the reality we live in.'
  )
  addParagraph(
    'We are living through the "Great Divorce": the decoupling of the capital markets from the productive, real-world economy. When the Price-to-Earnings (PE) ratio rises to historically high levels, the real-world disconnect happens. And right now, that disconnect is threatening to send net real value creation "into the toilet."'
  )
  addParagraph(
    'In the race between labor and capital, capital is lapping the field. Last year, real wages — the actual purchasing power of the average American worker — fell by 0.3% in a single month, reversing years of hard-won gains. Meanwhile, those sitting on assets saw a windfall. If you had your money in the S&P 500, you enjoyed an 18% return. To put that in human terms: the passive return on a $50,000 portfolio generated more income last year than the annual raise of a median worker. This is value extraction over value creation.'
  )

  /* ────────── SECTION 4: Why Existing Institutions Fail ────────── */
  addHeading('4. Why Existing Institutions Fail')
  addChart(chartInstitutions, 'Why Existing Institutions Fail: The Newtonian Trap')
  addParagraph(
    'Institutions like the Hoover Institution, the Cato Institute, and the Brookings Institution operate on assumptions and ideas largely rooted in the Newtonian paradigm. They view the economy as a mechanistic system, devoid of humans and nature, and as independent agents, which is further from the truth. They optimize for maximum extraction in the name of shareholder value creation, as if that is the ultimate motto for human existence, survival, and purpose, which affects humanity in profound ways.'
  )
  addParagraph(
    'These institutions seek to make extraction more palatable, not to replace extraction with regeneration, by looking at the interconnectedness of the system, and that the system change starts with the one thought, as it is the starting point, that affects the inner system and hence affects the whole system essentially, as everything is entangled with each other in profound ways.'
  )

  /* ────────── SECTION 5: ESG: Lip Service ────────── */
  addHeading('5. ESG: Lip Service')
  addChart(chartEsg, 'ESG: Lip Service — Fragmented Thought in Action')
  addParagraph(
    'To me, the response to these neo-liberal thoughts in the form of ESG and impact investing is nothing but lip service, as this is often fragmented thought in action, applying a thin ethical veneer to the same extractive capital structures, which are based on one thought of shareholder optimization in the short term, forgetting what will happen in a generation or so.'
  )
  addParagraph(
    'They accept a false dichotomy that doing good requires sacrificing financial return; this is also a fear-based assumption, not a factual one. They lack a rigorous philosophical arm; hence, they deploy capital without challenging the legal and ontological frameworks that make extraction possible in the first place.'
  )

  /* ────────── SECTION 6: Bohm\'s Implicate Order — Entanglement ────────── */
  addHeading('6. Bohm\'s Implicate Order — Entanglement')
  addParagraph(
    'David Bohm didn\'t see reality as individual parts bumping into each other; rather, he saw them as one cohesive system, entangled with each other, like one unbroken, flowing whole, like a river, which he essentially called an implicate order. In essence, our thoughts and the world are not two different things; they are essentially one and deeply entangled.'
  )
  addParagraph(
    'They are ONE system: the inner system — our thoughts, assumptions, perceptions, and abstraction — and the outer system (i.e., finance, society, nature, technology) are not separate, but are deeply entangled. Most of us try to change the outer system without realizing the underlying thought hasn\'t changed; the outer system just rearranges itself into the same old patterns because we haven\'t effectively changed our inner system of thoughts.'
  )
  addBlockquote(
    'We can\'t fix the world without fixing the thought first. That\'s the whole point — we need to go upstream to the source; there is no other alternative.'
  )

  /* ────────── SECTION 7: Think Upstream ────────── */
  addHeading('7. Think Upstream')
  addParagraph(
    'We need to think upstream: fuse philosophy with rigorous research through challenging thought and dialogue, and deploy capital in ways that push science beyond the current limits of our thinking, fund breakthroughs, and compound impact for humanity and nature.'
  )
  addParagraph('Upstream Institute operates through three interconnected pillars:')
  
  addChart(chartThreeLegs, 'The Three Pillars of Upstream Institute')

  addSubHeading('Pillar 1: Think & Dialogue')
  addChart(chartLeg1, 'Pillar 1: Think & Dialogue Lab', 140)
  addParagraph('Pushing the boundaries of thought by bringing authentic dialogue back into practice.')
  addBullet('', 'Content — Books, Podcasts, and philosophical inquiries')
  addBullet('', 'Research Papers, White Papers, and ontological studies')
  addBullet('', 'Curated Dialogue and Retreat Event Properties')

  addSubHeading('Pillar 2: Social Policy Lab')
  addChart(chartLeg2, 'Pillar 2: Social Policy Lab', 140)
  addParagraph('Leveraging Finland\'s and the Nordics\' unique administrative infrastructure as a living laboratory to experiment with regenerative social and economic policies.')
  addBullet('', 'Population-Scale Testing of progressive economic frameworks')
  addBullet('', 'Environmental-Scale Testing and natural resource stewardship')

  addSubHeading('Pillar 3: Capital Deployment')
  addChart(chartLeg3, 'Pillar 3: Capital Deployment Arm', 140)
  addParagraph('A dedicated capital arm funding research, basic sciences, breakthrough innovation, and transformative technologies.')
  addBullet('', 'Grants funding researchers in basic sciences and philosophy')
  addBullet('', 'Outcome Bonds linking debt returns to verified social and ecological outcomes')
  addBullet('', 'SME Patient Capital Vehicles providing permanent, non-extractive hybrid capital')
  addBullet('', 'Deep-tech funding with a multi-generational horizon for humanity and nature')

  addChart(chartCausal, 'Full Causal Chain: From Problem to Solution')

  /* ────────── SECTION 8: The Physical Space ────────── */
  addHeading('8. The Physical Space: Upstream and Downstream')
  addParagraph('The physical space we have acquired can be divided into two parts:')
  addChart(chartSpatial, 'Spatial Layout: Upstream Lab (Think), The Bridge, and Downstream Lab (Do)')

  addChart(photoEstate, 'The Upstream Sanctuary: Lakeside estate surrounded by Finnish pine forest for contemplative thinking and dialogue')

  addSubHeading('Upstream Lab - Think')
  addParagraph(
    'Think & Dialogue Forum will run workshops in cohorts of 15-25 people, wherein Paavo will focus on using principles of David Bohm to conduct dialogue exercises to allow us to activate our thoughts and help us decouple from our biases and memory so that we can start the thinking process from scratch, from zero, from singularity. Additionally, Paavo will use other great philosophers\' and scientists\' works to activate the thinking process, as David Bohm pointed out that thoughts are the root cause of all our problems.'
  )
  addParagraph(
    'Ideal participants will be philanthropists, large capital owners, corporate C-suite leaders, economists, scientists, and politicians.'
  )
  addParagraph(
    'The Upstream Lab is critical before anything we do because we have become slaves to thought; thought is like fire: it is a good servant but a bad master.'
  )
  addChart(photoDialogueSalon, 'Upstream Dialogue Salon: Facilitating Bohmian dialogue and deep reflection with views of forest and water')

  addSubHeading('Downstream Lab - Do')
  addParagraph(
    'Sagar and Elina will complement Paavo to bring back from the upstream thinking process to downstream, practical issues, wherein, with new, fresh thoughts and thinking, the participants will delve into working on potential solutions and try to connect the dots with the real-world issues that are being faced by society, the environment, and nature at large. They will also explore how we can push the boundaries of science and technology in ways that serve humanity rather than become a destructive force.'
  )
  addChart(photoStudio, 'Downstream Studio & Lab: Active prototyping, multi-disciplinary media, science, and practical synthesis')

  addParagraph(
    'We can\'t mindlessly have policies, science, and technology advancement without upstream thinking, as Bohm rightly pointed out in the book, Changing Consciousness:'
  )
  addBlockquote(
    'The more we automate industry, the more we isolate people, and the more routine, on the whole, people\'s work becomes, producing less satisfaction for people in their work and less meaning in their lives.',
    'David Bohm, Changing Consciousness'
  )
  addParagraph('From Finland, we invite the world to think upstream.')

  /* ────────── SECTION 9: About the Authors ────────── */
  addHeading('9. About the Authors')

  const addAuthorBlock = (avatarData: string | null, name: string, email: string, bio: string) => {
    const avatarDim = 16 // mm
    const avatarGap = 4
    const textStartX = avatarData ? margin + avatarDim + avatarGap : margin
    const textAvailableW = avatarData ? contentWidth - avatarDim - avatarGap : contentWidth

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(55, 55, 55)
    const bioLines = doc.splitTextToSize(bio, textAvailableW)
    const textHeight = bioLines.length * 4.8 + 12
    const blockHeight = Math.max(avatarDim + 6, textHeight)

    checkPageBreak(blockHeight + 6)

    if (avatarData) {
      doc.addImage(avatarData, 'PNG', margin, y, avatarDim, avatarDim, undefined, 'FAST')
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(25, 25, 25)
    doc.text(name, textStartX, y + 4.5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(100, 100, 100)
    doc.text(email, textStartX, y + 9)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(55, 55, 55)
    doc.text(bioLines, textStartX, y + 14)

    y += blockHeight + 6
  }

  addAuthorBlock(
    avatarSagar,
    'Sagar Tandon',
    's@threadsunite.xyz',
    'Sagar is an impact investor and capital allocator with more than a decade of global experience (emerging and developed markets) building impact funds, investing in more than 25+ impact ventures, and an active board member in three companies in the EU and one in South Korea.'
  )

  addAuthorBlock(
    avatarPaavo,
    'Paavo Pylkkanen',
    'paavo.pylkkanen@helsinki.fi',
    'Paavo is a distinguished philosopher whose decades of work on physicist David Bohm\'s theories of quantum physics and consciousness provide the ontological foundation for the Upstream Institute. He has extensively researched the concept of the "Implicate Order" — the view that reality is an unbroken, flowing whole rather than a collection of isolated parts. At the Institute, Paavo directs intellectual coherence, ensuring that all research, policy design, and capital deployment transcend the limitations of fragmented, mechanical thought.'
  )

  addAuthorBlock(
    avatarElina,
    'Elina Pylkkanen',
    'ElinaAP@proton.me',
    'Elina is a distinguished economist currently serving as Under-Secretary of State at Finland\'s Ministry of Economic Affairs and Employment. She holds a PhD in Economics and has previously served as Director of the Labor Institute for Economic Research (LABORE), Senior Economist at the OECD in Paris, and Visiting Scholar at Stanford University. Elina brings unparalleled expertise in labor markets, taxation, and social policy design. She leads the Upstream Nordic Social Policy Research Lab, translating philosophical frameworks into rigorous, population-scale economic interventions.'
  )

  /* ────────── PAGE NUMBERS & FOOTER ────────── */
  const totalPages = doc.internal.pages.length - 1
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(140, 140, 140)
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' })
    doc.text('Upstream Institute — Think Upstream White Paper', margin, pageHeight - 10)
  }

  onProgress?.('Saving file...')
  doc.save('Think-Upstream-White-Paper.pdf')
  onProgress?.('Complete')
}
