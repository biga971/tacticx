import '~/css/landing.css'
import { Head } from '@inertiajs/react'
import LandingNav from '~/components/landing/nav'
import LandingFooter from '~/components/landing/footer'
import WaitlistForm from '~/components/landing/waitlist_form'
import { useReveal } from '~/components/landing/use_reveal'
import { IconCheck, IconCheckBold, IconX, IconPin, IconShield, IconNoEntry } from '~/components/landing/icons'

export default function Home() {
  useReveal()

  return (
    <div className="lp">
      <Head title="Tacticx — Le compagnon stratégique pour Pokémon Champions">
        <meta
          name="description"
          content="Méta en temps réel, team builder complet, calculateur de dégâts offline et feed communautaire. Tout l'arsenal compétitif VGC & Singles, sur mobile, en français."
        />
      </Head>

      <div className="grain" />
      <LandingNav home />
      <span id="top" />

      {/* ════════ HERO ════════ */}
      <header className="hero">
        <div className="hero-glow" />
        <div className="wrap hero-inner">
          <div className="hero-copy">
            <span className="hero-badge reveal">
              <span className="dot" />
              Pour Pokémon Champions · VGC &amp; Singles
            </span>
            <h1 className="hero-title reveal">
              Le compagnon stratégique que les joueurs compétitifs{' '}
              <span className="em">attendaient.</span>
            </h1>
            <p className="hero-sub reveal">
              Méta en temps réel, team builder complet, calculateur de dégâts offline et feed
              communautaire. Tout l'arsenal compétitif, sur mobile, en français.
            </p>

            <div className="reveal">
              <WaitlistForm
                variant="hero"
                buttonLabel="Rejoindre la liste"
                successText="Tu es sur la liste — accès bêta prioritaire réservé."
              />
            </div>

            <div className="hero-secondary reveal">
              <a href="#features">Voir les features ↓</a>
            </div>

            <div className="hero-stats reveal">
              <div className="hstat">
                <div className="v">0</div>
                <div className="l">app mobile sérieuse existante</div>
              </div>
              <div className="hstat">
                <div className="v">VGC &amp; Singles</div>
                <div className="l">les deux formats couverts</div>
              </div>
              <div className="hstat">
                <div className="v">Gratuit</div>
                <div className="l">au lancement</div>
              </div>
            </div>
          </div>

          {/* phone mockup: méta */}
          <div className="hero-media reveal">
            <div className="phone">
              <div className="phone-screen">
                <div className="ph-status">
                  <span>9:41</span>
                  <span className="si">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2 17h3v4H2zm5-4h3v8H7zm5-5h3v13h-3zm5-5h3v18h-3z" />
                    </svg>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 9a15 15 0 0 1 20 0M5 13a9 9 0 0 1 14 0M8.5 16.5a4 4 0 0 1 7 0" />
                    </svg>
                    <svg viewBox="0 0 26 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <rect x="1.5" y="7" width="19" height="10" rx="2.5" />
                      <rect x="3.5" y="9" width="13" height="6" rx="1" fill="currentColor" />
                      <path d="M22 10v4" strokeLinecap="round" />
                    </svg>
                  </span>
                </div>
                <div className="ph-head">
                  <div className="ph-h-row">
                    <h4>Méta</h4>
                    <span className="eyebrow">S26 · sem. 3</span>
                  </div>
                  <div className="ph-seg">
                    <span className="on">VGC</span>
                    <span>Singles</span>
                  </div>
                </div>
                <div className="ph-meta-eyebrow">
                  <span>Top 20 · usage</span>
                  <span>tendance 7j</span>
                </div>

                {META_ROWS.map((r) => (
                  <div key={r.rank}>
                    <div className="mrow">
                      <span className="mrank">{r.rank}</span>
                      <div className="sprite" />
                      <div className="mbody">
                        <div className="mname">{r.name}</div>
                        <div className="mmeta">{r.types}</div>
                      </div>
                      <div className="musage">
                        <div className="u">{r.usage}</div>
                        <div className={`mtrend ${r.dir}`}>{r.trend}</div>
                      </div>
                    </div>
                    <div className="mbar">
                      <i style={{ width: r.bar }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ════════ POURQUOI ════════ */}
      <section className="block" id="apropos">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow sec-eyebrow">Pourquoi Tacticx</span>
            <h2>
              Les outils compétitifs existent. <span className="dim">Pas sur mobile.</span>
            </h2>
            <p>
              Préparer un tournoi VGC aujourd'hui, c'est jongler entre un site web figé en 2015, un
              logiciel desktop et des menus enfouis dans le jeu. Rien qui tienne dans une poche, rien
              en français.
            </p>
          </div>

          <div className="compare">
            <div className="cmp reveal">
              <div className="cmp-name">Pikalytics</div>
              <div className="cmp-tag">données méta</div>
              <ul>
                <li><span style={iconBox}><IconX /></span>Web only, jamais pensé mobile</li>
                <li><span style={iconBox}><IconX /></span>UX datée, navigation lourde</li>
                <li><span style={iconBox}><IconX /></span>Anglais uniquement</li>
              </ul>
            </div>
            <div className="cmp reveal">
              <div className="cmp-name">Coup Critique</div>
              <div className="cmp-tag">calc de dégâts</div>
              <ul>
                <li><span style={iconBox}><IconX /></span>Desktop uniquement</li>
                <li><span style={iconBox}><IconX /></span>Inutilisable en tournoi, sur place</li>
                <li><span style={iconBox}><IconX /></span>Pas de team builder lié</li>
              </ul>
            </div>
            <div className="cmp win reveal">
              <div className="cmp-name">Tacticx</div>
              <div className="cmp-tag">tout-en-un · mobile</div>
              <ul>
                <li><span style={iconBox}><IconCheckBold /></span>Méta, builder &amp; calc dans une poche</li>
                <li><span style={iconBox}><IconCheckBold /></span>En français, temps réel</li>
                <li><span style={iconBox}><IconCheckBold /></span>Calc 100 % offline, en tournoi</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ FEATURES ════════ */}
      <section className="block" id="features" style={{ paddingTop: 40 }}>
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow sec-eyebrow">Features</span>
            <h2>
              Quatre outils. <span className="dim">Un seul réflexe.</span>
            </h2>
            <p>
              Chaque écran a été pensé pour un joueur qui connaît déjà le vocabulaire. Pas de
              tutoriel, pas de bruit — la donnée, directement.
            </p>
          </div>

          {/* Feature 1 : Méta */}
          <div className="feat">
            <div className="feat-text reveal">
              <span className="feat-num">01 · MÉTA</span>
              <h3>La méta en temps réel</h3>
              <p className="lead">
                Le top 20 des Pokémon avec usage, winrate et tendance hebdomadaire. Les données VGC
                et Singles sont séparées — jamais mélangées.
              </p>
              <ul className="feat-list">
                <li><span style={iconBox}><IconCheck /></span>Usage &amp; winrate à la décimale, figures tabulaires</li>
                <li><span style={iconBox}><IconCheck /></span>Tendances 7 jours — présence en hausse ou en chute</li>
                <li><span style={iconBox}><IconCheck /></span>Bascule VGC / Singles en un geste</li>
              </ul>
            </div>
            <div className="feat-media reveal">
              <div className="device">
                <div className="device-glow" />
                <div className="device-eyebrow">
                  <span>MÉTA · S26 · SEMAINE 3</span>
                  <span className="pill">VGC</span>
                </div>
                <div style={{ margin: '0 -10px' }}>
                  {DEVICE_META.map((r) => (
                    <div key={r.rank}>
                      <div className="mrow" style={{ paddingLeft: 8, paddingRight: 8 }}>
                        <span className="mrank">{r.rank}</span>
                        <div className="sprite" />
                        <div className="mbody">
                          <div className="mname">{r.name}</div>
                          <div className="mmeta">{r.types}</div>
                        </div>
                        <div className="musage">
                          <div className="u">{r.usage}</div>
                          <div className={`mtrend ${r.dir}`}>{r.trend}</div>
                        </div>
                      </div>
                      <div className="mbar" style={{ marginLeft: 8, marginRight: 8 }}>
                        <i style={{ width: r.bar }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 : Team Builder */}
          <div className="feat">
            <div className="feat-text reveal">
              <span className="feat-num">02 · BUILDER</span>
              <h3>Team builder complet</h3>
              <p className="lead">
                Six slots, sliders d'EV, et une analyse de couverture sur les 18 types calculée en
                direct. Une équipe complète, exportable en Poképaste d'un tap.
              </p>
              <ul className="feat-list">
                <li><span style={iconBox}><IconCheck /></span>Sliders d'EV avec total live sur 508</li>
                <li><span style={iconBox}><IconCheck /></span>Couverture offensive &amp; trous défensifs visibles</li>
                <li><span style={iconBox}><IconCheck /></span>Export Poképaste en un tap</li>
              </ul>
            </div>
            <div className="feat-media reveal">
              <div className="device">
                <div className="device-glow" />
                <div className="device-eyebrow">
                  <span>TON ÉQUIPE · 6 / 6</span>
                  <span className="pill">508 EV</span>
                </div>
                <div className="tb-grid">
                  {TEAM_SLOTS.map((s) => (
                    <div className="tb-slot" key={s.name}>
                      <div className="top">
                        <div className="sp" />
                        <div className="nm">{s.name}</div>
                      </div>
                      <div className="badges">
                        {s.badges.map((b) => (
                          <span className={`tbadge ${b.cls}`} key={b.label}>
                            {b.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cov">
                  <div className="cov-label">Couverture offensive · 18 types</div>
                  <div className="cov-grid">
                    {COVERAGE.map((c, i) => (
                      <span
                        className="cov-cell"
                        key={i}
                        style={{ background: `var(--${c.color})`, opacity: c.opacity }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3 : Calc */}
          <div className="feat">
            <div className="feat-text reveal">
              <span className="feat-num">03 · CALC</span>
              <h3>Calculateur de dégâts offline</h3>
              <p className="lead">
                La formule exacte de Champions, 100 % hors-ligne. Les 16 rolls, les chances de KO et
                toutes les conditions de terrain — utilisable en plein tournoi, sans réseau.
              </p>
              <ul className="feat-list">
                <li><span style={iconBox}><IconCheck /></span>16 rolls détaillés + pourcentage de KO</li>
                <li><span style={iconBox}><IconCheck /></span>Météo, terrain, écrans, objets, talents</li>
                <li><span style={iconBox}><IconCheck /></span>Zéro réseau requis — tout embarqué</li>
              </ul>
            </div>
            <div className="feat-media reveal">
              <div className="device">
                <div className="device-glow" />
                <div className="device-eyebrow">
                  <span>CALCUL DE DÉGÂTS</span>
                  <span className="pill">OFFLINE</span>
                </div>
                <div className="calc-row">
                  <div className="sp" />
                  <span className="arrow">→</span>
                  <div className="sp" />
                </div>
                <div className="calc-kobox">
                  <div className="big">
                    87.5<small> %</small>
                  </div>
                  <div className="cap">2HKO garanti</div>
                </div>
                <div className="histo">
                  {HISTO.map((h, i) => (
                    <i key={i} className={h.peak ? 'peak' : undefined} style={{ height: h.h }} />
                  ))}
                </div>
                <div className="calc-meta">
                  <span className="calc-chip">184 – 218 pv</span>
                  <span className="calc-chip">Pluie</span>
                  <span className="calc-chip">Tera Eau</span>
                  <span className="calc-chip">252 Atk Spé</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4 : Communauté */}
          <div className="feat">
            <div className="feat-text reveal">
              <span className="feat-num">04 · COMMUNAUTÉ</span>
              <h3>Le feed de la communauté</h3>
              <p className="lead">
                Les équipes publiées par les autres joueurs, recherchables par Pokémon et filtrables
                par budget VP. Ouvre n'importe quelle équipe directement dans ton builder.
              </p>
              <ul className="feat-list">
                <li><span style={iconBox}><IconCheck /></span>Recherche par Pokémon, filtres budget VP</li>
                <li><span style={iconBox}><IconCheck /></span>Ouvrir une équipe dans le builder en un tap</li>
                <li><span style={iconBox}><IconCheck /></span>Compositions issues des tops tournois</li>
              </ul>
            </div>
            <div className="feat-media reveal">
              <div className="device">
                <div className="device-glow" />
                <div className="device-eyebrow">
                  <span>COMMUNAUTÉ · 1 248 ÉQUIPES</span>
                  <span className="pill">VGC</span>
                </div>
                {FEED.map((f) => (
                  <div className="feed-card" key={f.title}>
                    <div className="feed-top">
                      <span className="ti">{f.title}</span>
                      <span className="vp">{f.vp}</span>
                    </div>
                    <div className="feed-team">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div className="sp" key={i} />
                      ))}
                    </div>
                    <div className="feed-foot">
                      <span>par {f.author}</span>
                      <span>·</span>
                      <span>{f.opens}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ TIMELINE ════════ */}
      <section className="block">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow sec-eyebrow">Calendrier</span>
            <h2>Sois parmi les premiers.</h2>
            <p>
              Tacticx avance au rythme de Pokémon Champions. La bêta fermée est déjà en cours — les
              places de lancement sont limitées.
            </p>
          </div>
          <div className="timeline">
            <div className="tl-step done reveal">
              <div className="tl-when">Maintenant</div>
              <div className="tl-title">Bêta fermée VGC France</div>
              <div className="tl-desc">
                Un premier cercle de joueurs compétitifs teste la méta et le builder en conditions
                réelles.
              </div>
            </div>
            <div className="tl-step next reveal">
              <div className="tl-when">Juin 2026</div>
              <div className="tl-title">Lancement mobile</div>
              <div className="tl-desc">
                Tacticx sort en même temps que Pokémon Champions sur mobile. Gratuit au lancement.
              </div>
            </div>
            <div className="tl-step next reveal">
              <div className="tl-when">Août 2026</div>
              <div className="tl-title">Championnats du Monde</div>
              <div className="tl-desc">
                Cap sur San Francisco — données live, scénarios de tournoi et feed dédié pour les
                Worlds.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ CTA FINAL ════════ */}
      <section className="block cta-final" id="waitlist">
        <div className="wrap">
          <div className="cta-card reveal">
            <div className="glow" />
            <h2>Prêt à passer au niveau supérieur ?</h2>
            <p>Rejoins la liste d'attente. Accès bêta prioritaire pour les 500 premiers.</p>
            <WaitlistForm
              variant="cta"
              buttonLabel="Rejoindre"
              successText="Tu es sur la liste — on te contacte pour la bêta."
            />
            <div className="cta-note">Pas de spam. Désabonnement en un clic.</div>
            <div className="trust">
              <span className="chip">
                <IconPin />
                Fait en Guadeloupe
              </span>
              <span className="chip">
                <IconShield />
                Indépendant
              </span>
              <span className="chip">
                <IconNoEntry />
                Pas affilié à Nintendo
              </span>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter home />
    </div>
  )
}

/* ── mock data ── */
const iconBox = { display: 'inline-flex', flexShrink: 0 } as const

const META_ROWS = [
  { rank: 1, name: 'Flutter Mane', types: 'Fée · Spectre', usage: '41.2 %', dir: 'up', trend: '▲ 4.1', bar: '92%' },
  { rank: 2, name: 'Incinéroar', types: 'Feu · Ténèbres', usage: '38.7 %', dir: 'flat', trend: '— 0.3', bar: '86%' },
  { rank: 3, name: 'Ogerpon', types: 'Plante · Roche', usage: '33.5 %', dir: 'up', trend: '▲ 6.8', bar: '74%' },
  { rank: 4, name: 'Urshifu', types: 'Combat · Eau', usage: '29.1 %', dir: 'down', trend: '▼ 2.2', bar: '65%' },
  { rank: 5, name: 'Rillaboom', types: 'Plante', usage: '26.4 %', dir: 'up', trend: '▲ 1.5', bar: '58%' },
]

const DEVICE_META = [
  { rank: 1, name: 'Flutter Mane', types: 'Fée · Spectre', usage: '41.2 %', dir: 'up', trend: '▲ 4.1', bar: '92%' },
  { rank: 2, name: 'Ogerpon', types: 'Plante · Roche', usage: '33.5 %', dir: 'up', trend: '▲ 6.8', bar: '74%' },
  { rank: 3, name: 'Urshifu', types: 'Combat · Eau', usage: '29.1 %', dir: 'down', trend: '▼ 2.2', bar: '65%' },
]

const TEAM_SLOTS = [
  { name: 'Flutter Mane', badges: [{ label: 'Fée', cls: 't-fairy' }, { label: 'Spectre', cls: 't-ghost' }] },
  { name: 'Incinéroar', badges: [{ label: 'Feu', cls: 't-fire' }, { label: 'Tén.', cls: 't-ground' }] },
  { name: 'Urshifu', badges: [{ label: 'Combat', cls: 't-fighting' }, { label: 'Eau', cls: 't-water' }] },
  { name: 'Rillaboom', badges: [{ label: 'Plante', cls: 't-grass' }] },
  { name: 'Amoonguss', badges: [{ label: 'Plante', cls: 't-grass' }, { label: 'Poison', cls: 't-psychic' }] },
  { name: 'Landorus', badges: [{ label: 'Sol', cls: 't-ground' }, { label: 'Vol', cls: 't-flying' }] },
]

const COVERAGE = [
  { color: 'success', opacity: 0.85 }, { color: 'success', opacity: 0.55 }, { color: 'warning', opacity: 0.5 },
  { color: 'success', opacity: 0.85 }, { color: 'success', opacity: 0.7 }, { color: 'danger', opacity: 0.6 },
  { color: 'success', opacity: 0.85 }, { color: 'warning', opacity: 0.5 }, { color: 'success', opacity: 0.6 },
  { color: 'success', opacity: 0.85 }, { color: 'success', opacity: 0.7 }, { color: 'warning', opacity: 0.55 },
  { color: 'success', opacity: 0.85 }, { color: 'danger', opacity: 0.55 }, { color: 'success', opacity: 0.7 },
  { color: 'success', opacity: 0.85 }, { color: 'warning', opacity: 0.5 }, { color: 'success', opacity: 0.8 },
]

const HISTO = [
  { h: '30%' }, { h: '38%' }, { h: '42%' }, { h: '48%' }, { h: '55%' }, { h: '62%' }, { h: '70%' },
  { h: '82%', peak: true }, { h: '100%', peak: true }, { h: '88%', peak: true }, { h: '74%' },
  { h: '66%' }, { h: '58%' }, { h: '50%' }, { h: '44%' }, { h: '36%' },
]

const FEED = [
  { title: 'Sun offense · Top 8 Lyon', vp: '28 VP', author: '@kanto_lab', opens: '312 ouvertures' },
  { title: 'Trick Room balance', vp: '24 VP', author: '@vgc_marie', opens: '197 ouvertures' },
]
