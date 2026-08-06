import style from './trust-signals.module.scss';

interface TrustFact {
    id: string;
    icon: string;
    title: string;
    description: string;
}

const TRUST_FACTS: TrustFact[] = [
    {
        id: 'experience',
        icon: '10+',
        title: 'Experience',
        description: 'Over a decade of curating quality fashion for customers who care about craft.',
    },
    {
        id: 'selection',
        icon: '5K+',
        title: 'Selection',
        description: 'Thousands of items across every category, updated with new arrivals weekly.',
    },
    {
        id: 'service',
        icon: '24/7',
        title: 'Service',
        description: 'Friendly, responsive support and hassle-free returns whenever you need them.',
    },
];

export const TrustSignals = () => {
    return (
        <section className={style.trustSignals} aria-label="Why choose us">
            <div className="container">
                <h2 className={style.trustSignals__title}>Why Choose Us</h2>

                <div className={style.trustSignals__grid}>
                    {TRUST_FACTS.map((fact) => (
                        <article key={fact.id} className={style.trustSignals__card}>
                            <span className={style.trustSignals__icon} aria-hidden="true">{fact.icon}</span>
                            <h3 className={style.trustSignals__cardTitle}>{fact.title}</h3>
                            <p className={style.trustSignals__cardDescription}>{fact.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};
