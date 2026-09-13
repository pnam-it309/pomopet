package pet

import (
	"context"
	"fmt"
	"math"
	"time"

	"pomopet/internal/common/config"
	"pomopet/internal/common/eventbus"
)

type Service interface {
	GetPet(ctx context.Context, userID string) (*Pet, error)
	CreateStarterPet(ctx context.Context, userID, petName string, species Species) (*Pet, error)
	Feed(ctx context.Context, userID, foodItemID string, hungerGain, happinessGain, expGain int) (*Pet, error)
	Pat(ctx context.Context, userID string) (*Pet, error)
	EquipHat(ctx context.Context, userID, hatID string) (*Pet, error)
	SetRoomTheme(ctx context.Context, userID, themeID string) (*Pet, error)
	SetPose(ctx context.Context, userID, state string) (*Pet, error)
	AddExp(ctx context.Context, userID string, rawExp int) (*Pet, bool, error)
}

type service struct {
	repo Repository
	cfg  *config.Config
	bus  *eventbus.EventBus
}

func NewService(repo Repository, cfg *config.Config, bus *eventbus.EventBus) Service {
	return &service{
		repo: repo,
		cfg:  cfg,
		bus:  bus,
	}
}

func (s *service) GetPet(ctx context.Context, userID string) (*Pet, error) {
	pet, err := s.repo.FindByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("loi lay thong tin thu cung: %w", err)
	}
	if pet == nil {
		// Create default starter pet if none exists
		return s.CreateStarterPet(ctx, userID, "Mochi", SpeciesCat)
	}
	s.applyVitalityDecay(pet)
	_ = s.repo.Update(ctx, pet)
	return pet, nil
}

func (s *service) CreateStarterPet(ctx context.Context, userID, petName string, species Species) (*Pet, error) {
	if species == "" {
		species = SpeciesCat
	}
	behavior := NewSpeciesBehavior(species)
	if petName == "" {
		petName = behavior.DefaultName()
	}

	_ = s.repo.DeleteByUserID(ctx, userID)

	pet := &Pet{
		ID:               fmt.Sprintf("pet_%d", time.Now().UnixNano()),
		UserID:           userID,
		Name:             petName,
		Species:          species,
		Stage:            StageBaby,
		Level:            1,
		Exp:              0,
		ExpToNext:        s.cfg.PetBaseExpToNext,
		Health:           s.cfg.PetMaxStat,
		Hunger:           80,
		Happiness:        90,
		Energy:           s.cfg.PetMaxStat,
		State:            "idle",
		EquippedHat:      "",
		RoomTheme:        "theme_cozy",
		LastFedAt:        time.Now(),
		LastInteractedAt: time.Now(),
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	if err := s.repo.Create(ctx, pet); err != nil {
		return nil, fmt.Errorf("loi tao thu cung: %w", err)
	}
	return pet, nil
}

func (s *service) Feed(ctx context.Context, userID, foodItemID string, hungerGain, happinessGain, expGain int) (*Pet, error) {
	pet, err := s.GetPet(ctx, userID)
	if err != nil {
		return nil, err
	}

	if hungerGain <= 0 {
		hungerGain = 20
	}
	if happinessGain <= 0 {
		happinessGain = 5
	}
	if expGain <= 0 {
		expGain = 10
	}

	pet.Hunger = int(math.Min(float64(s.cfg.PetMaxStat), float64(pet.Hunger+hungerGain)))
	pet.Happiness = int(math.Min(float64(s.cfg.PetMaxStat), float64(pet.Happiness+happinessGain)))
	pet.LastFedAt = time.Now()
	pet.LastInteractedAt = time.Now()

	s.addExpInternal(pet, expGain)

	if err := s.repo.Update(ctx, pet); err != nil {
		return nil, err
	}

	_ = s.bus.Publish(ctx, eventbus.PetInteractedEvent{
		UserID:         userID,
		Action:         "feed",
		FoodItemID:     foodItemID,
		HappinessDelta: happinessGain,
		HungerDelta:    hungerGain,
	})

	return pet, nil
}

func (s *service) Pat(ctx context.Context, userID string) (*Pet, error) {
	pet, err := s.GetPet(ctx, userID)
	if err != nil {
		return nil, err
	}

	pet.Happiness = int(math.Min(float64(s.cfg.PetMaxStat), float64(pet.Happiness+5)))
	pet.LastInteractedAt = time.Now()

	if err := s.repo.Update(ctx, pet); err != nil {
		return nil, err
	}

	_ = s.bus.Publish(ctx, eventbus.PetInteractedEvent{
		UserID:         userID,
		Action:         "pat",
		HappinessDelta: 5,
	})

	return pet, nil
}

func (s *service) EquipHat(ctx context.Context, userID, hatID string) (*Pet, error) {
	pet, err := s.GetPet(ctx, userID)
	if err != nil {
		return nil, err
	}
	pet.EquippedHat = hatID
	if err := s.repo.Update(ctx, pet); err != nil {
		return nil, err
	}
	return pet, nil
}

func (s *service) SetRoomTheme(ctx context.Context, userID, themeID string) (*Pet, error) {
	pet, err := s.GetPet(ctx, userID)
	if err != nil {
		return nil, err
	}
	pet.RoomTheme = themeID
	if err := s.repo.Update(ctx, pet); err != nil {
		return nil, err
	}
	return pet, nil
}

func (s *service) SetPose(ctx context.Context, userID, state string) (*Pet, error) {
	pet, err := s.GetPet(ctx, userID)
	if err != nil {
		return nil, err
	}
	pet.State = state
	if err := s.repo.Update(ctx, pet); err != nil {
		return nil, err
	}
	return pet, nil
}

func (s *service) AddExp(ctx context.Context, userID string, rawExp int) (*Pet, bool, error) {
	pet, err := s.GetPet(ctx, userID)
	if err != nil {
		return nil, false, err
	}

	behavior := NewSpeciesBehavior(pet.Species)
	scaledExp := int(float64(rawExp) * behavior.ExpMultiplier())
	if scaledExp < 1 {
		scaledExp = 1
	}

	leveledUp := s.addExpInternal(pet, scaledExp)
	if err := s.repo.Update(ctx, pet); err != nil {
		return nil, false, err
	}
	return pet, leveledUp, nil
}

func (s *service) addExpInternal(pet *Pet, exp int) bool {
	pet.Exp += exp
	leveledUp := false

	for pet.Exp >= pet.ExpToNext {
		pet.Exp -= pet.ExpToNext
		pet.Level++
		leveledUp = true
		pet.ExpToNext = int(float64(s.cfg.PetBaseExpToNext) * math.Pow(s.cfg.PetExpScaleFactor, float64(pet.Level-1)))
	}

	behavior := NewSpeciesBehavior(pet.Species)
	_, teen, adult, mythic := behavior.EvolutionThresholds()
	switch {
	case pet.Level >= mythic:
		pet.Stage = StageMythic
	case pet.Level >= adult:
		pet.Stage = StageAdult
	case pet.Level >= teen:
		pet.Stage = StageTeen
	default:
		pet.Stage = StageBaby
	}

	return leveledUp
}

func (s *service) applyVitalityDecay(pet *Pet) {
	now := time.Now()
	hoursSinceFed := now.Sub(pet.LastFedAt).Hours()
	if hoursSinceFed > 1 {
		decayHunger := int(hoursSinceFed) * s.cfg.PetHungerDecayRate
		pet.Hunger = int(math.Max(10, float64(pet.Hunger-decayHunger)))
	}

	hoursSinceInteracted := now.Sub(pet.LastInteractedAt).Hours()
	if hoursSinceInteracted > 1 {
		decayHappy := int(hoursSinceInteracted) * s.cfg.PetHappyDecayRate
		pet.Happiness = int(math.Max(10, float64(pet.Happiness-decayHappy)))
	}
}
