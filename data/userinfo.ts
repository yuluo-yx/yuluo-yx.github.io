export type UseInfo = {
  use?: string
  deigmata_paideias?: string
}

type UseValue = {
  href?: string
  title: string
}

const use: UseInfo = {
  use: 'https://github.com/yuluo-yx/use',
  deigmata_paideias: 'https://github.com/deigmata-paideias/deigmata-paideias',
}

const useSet: Record<keyof UseInfo, UseValue> = {
  use: {
    href: use.use,
    title: 'use',
  },
  deigmata_paideias: {
    href: use.deigmata_paideias,
    title: 'Everythings',
  },
}

export default useSet
