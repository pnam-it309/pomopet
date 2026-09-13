package pet

// SpeciesBehavior defines polymorphic species traits (OOP Strategy Pattern)
type SpeciesBehavior interface {
	ExpMultiplier() float64
	CoinMultiplier() float64
	EvolutionThresholds() (baby, teen, adult, mythic int)
	Dialogue(mood string) string
	DefaultName() string
}

// CatBehavior
type CatBehavior struct{}

func (CatBehavior) ExpMultiplier() float64 { return 1.0 }
func (CatBehavior) CoinMultiplier() float64 { return 1.3 } // High coin multiplier
func (CatBehavior) EvolutionThresholds() (int, int, int, int) { return 1, 10, 25, 50 }
func (CatBehavior) Dialogue(mood string) string {
	switch mood {
	case "hungry":
		return "Meo... Doi bung roi, cho toi an di ma!"
	case "sleepy":
		return "Kho kho... Nghi ngoi lay lai nang luong nao."
	case "happy":
		return "Nhao! Ban hoc cham qua, tui rat tu hao!"
	default:
		return "San sang tap trung cung ban roi day!"
	}
}
func (CatBehavior) DefaultName() string { return "Mochi" }

// DragonBehavior
type DragonBehavior struct{}

func (DragonBehavior) ExpMultiplier() float64 { return 1.25 } // High exp multiplier
func (DragonBehavior) CoinMultiplier() float64 { return 1.1 }
func (DragonBehavior) EvolutionThresholds() (int, int, int, int) { return 1, 15, 30, 60 }
func (DragonBehavior) Dialogue(mood string) string {
	switch mood {
	case "hungry":
		return "Lua trong bung da tat! Can tiep them thuc an!"
	case "sleepy":
		return "Nghi ngoi de tich luy ngon lua bung chay!"
	case "happy":
		return "Ngheo ngon lua nhiet huyet! Hoc rat hieu qua!"
	default:
		return "Nhiet huyet hoc tap san sang bieu dien!"
	}
}
func (DragonBehavior) DefaultName() string { return "Sparky" }

// SproutBehavior
type SproutBehavior struct{}

func (SproutBehavior) ExpMultiplier() float64 { return 1.1 }
func (SproutBehavior) CoinMultiplier() float64 { return 1.0 }
func (SproutBehavior) EvolutionThresholds() (int, int, int, int) { return 1, 8, 20, 40 }
func (SproutBehavior) Dialogue(mood string) string {
	switch mood {
	case "hungry":
		return "Can duong chat de vuon len mam xanh!"
	case "sleepy":
		return "Thu thai trong yen binh..."
	case "happy":
		return "Cam giac tinh tao va thanh than tuyet voi!"
	default:
		return "Moi phut giay deu la mam song moi."
	}
}
func (SproutBehavior) DefaultName() string { return "Sprout" }

// PenguinBehavior
type PenguinBehavior struct{}

func (PenguinBehavior) ExpMultiplier() float64 { return 1.15 }
func (PenguinBehavior) CoinMultiplier() float64 { return 1.2 }
func (PenguinBehavior) EvolutionThresholds() (int, int, int, int) { return 1, 12, 28, 55 }
func (PenguinBehavior) Dialogue(mood string) string {
	switch mood {
	case "hungry":
		return "Gia bang dang lan toa... Can ca de am bung!"
	case "sleepy":
		return "Dung vung trong gio lanh, nghi ngoi nao."
	case "happy":
		return "Ky luat va kien tri luon dan toi thanh cong!"
	default:
		return "Dung gio, nghiem tuc, khong tri hoan."
	}
}
func (PenguinBehavior) DefaultName() string { return "Pingu" }

// NewSpeciesBehavior is the Factory method for pet species
func NewSpeciesBehavior(species Species) SpeciesBehavior {
	switch species {
	case SpeciesDragon:
		return DragonBehavior{}
	case SpeciesSprout:
		return SproutBehavior{}
	case SpeciesPenguin:
		return PenguinBehavior{}
	case SpeciesCat:
	default:
		return CatBehavior{}
	}
	return CatBehavior{}
}
