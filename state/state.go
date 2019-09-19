package state

import (
	"sync"
	"time"
)

var (
	stateTracker *StateTracker
	once         sync.Once
)

type State struct {
	Type     string
	Status   string
	At       time.Time
	Duration time.Duration
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

func (st *StateTracker) Read(key string) (State, bool) {
	st.RLock()
	defer st.RUnlock()

	state, ok := st.state[key]
	return state, ok
}

func (st *StateTracker) Delete(key string) {
	st.Lock()
	defer st.Unlock()

	delete(st.state, key)
}

func (st *StateTracker) Set(key string, state State) {
	st.Lock()
	defer st.Unlock()

	st.state[key] = state
}
