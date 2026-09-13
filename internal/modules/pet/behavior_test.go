package pet

import (
	"testing"
)

func TestSpeciesPolymorphism(t *testing.T) {
	cat := NewSpeciesBehavior(SpeciesCat)
	dragon := NewSpeciesBehavior(SpeciesDragon)
	sprout := NewSpeciesBehavior(SpeciesSprout)
	penguin := NewSpeciesBehavior(SpeciesPenguin)

	if cat.CoinMultiplier() <= dragon.CoinMultiplier() {
		t.Errorf("expected cat to have higher coin multiplier")
	}

	if dragon.ExpMultiplier() <= cat.ExpMultiplier() {
		t.Errorf("expected dragon to have higher exp multiplier")
	}

	if sprout.DefaultName() != "Sprout" || penguin.DefaultName() != "Pingu" {
		t.Errorf("unexpected default pet names")
	}
}
