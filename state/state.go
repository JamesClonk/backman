package state

import (
	"sync"
	"time"

	"github.com/swisscom/backman/config"
)

var (
	stateTracker *StateTracker
	once         sync.Once
)

type State struct {
	Service   config.Service
	Operation string
	Status    string
	Filename  string
	At        time.Time
	Duration  time.Duration
}

type StateTracker struct {
	*sync.RWMutex
	state map[string]State
}

func Tracker() *StateTracker {
	once.Do(func() {
		stateTracker = newStateTracker()
	})
	return stateTracker
}

func newStateTracker() *StateTracker {
	return &StateTracker{
		&sync.RWMutex{},
		make(map[string]State),
	}
}

func (st *StateTracker) List() []State {
	st.RLock()
	defer st.RUnlock()

	states := make([]State, 0)
	for _, state := range st.state {
		states = append(states, state)
	}
	return states
}

func (st *StateTracker) Get(service config.Service) (State, bool) {
	st.RLock()
	defer st.RUnlock()

	state, ok := st.state[service.Key()]
	return state, ok
}

func (st *StateTracker) Delete(service config.Service) {
	st.Lock()
	defer st.Unlock()

	delete(st.state, service.Key())
}

func (st *StateTracker) Set(service config.Service, state State) {
	st.Lock()
	defer st.Unlock()

	state.Service = service
	st.state[service.Key()] = state
}
