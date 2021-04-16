package state

import (
	"sync"
	"time"

	"github.com/swisscom/backman/service/util"
)

var (
	stateTracker *StateTracker
	once         sync.Once
)

// swagger:response state
type State struct {
	Service   util.Service  `json:",omitempty"`
	Operation string        `json:",omitempty"`
	Status    string        `json:",omitempty"`
	Filename  string        `json:",omitempty"`
	At        time.Time     `json:",omitempty"`
	Duration  time.Duration `json:",omitempty"`
}

// swagger:response states
type States []State

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

func (st *StateTracker) Get(service util.Service) (State, bool) {
	st.RLock()
	defer st.RUnlock()

	state, ok := st.state[service.Key()]
	return state, ok
}

func (st *StateTracker) Delete(service util.Service) {
	st.Lock()
	defer st.Unlock()

	delete(st.state, service.Key())
}

func (st *StateTracker) Set(service util.Service, state State) {
	st.Lock()
	defer st.Unlock()

	state.Service = service
	st.state[service.Key()] = state
}
