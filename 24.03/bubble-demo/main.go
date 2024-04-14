package main

import (
	"fmt"
	"strings"

	"github.com/charmbracelet/bubbles/textarea"
	"github.com/charmbracelet/bubbles/viewport"
	tea "github.com/charmbracelet/bubbletea"
)

func main() {
	tea.NewProgram(initialModel()).Run()
}

type model struct {
	viewport viewport.Model
	messages []string
	textarea textarea.Model
	state    int
	width    int
	height   int
}

func initialModel() model {
	ta := textarea.New()
	ta.Placeholder = "Send a message..."
	ta.Focus()

	ta.Prompt = "┃ "
	ta.CharLimit = 280

	ta.ShowLineNumbers = false

	vp := viewport.New(10, 10)
	vp.SetContent(`Welcome!`)

	ta.KeyMap.InsertNewline.SetEnabled(false)

	return model{
		textarea: ta,
		messages: []string{},
		viewport: vp,
	}
}

func (m model) Init() tea.Cmd {
	return textarea.Blink
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var (
		tiCmd tea.Cmd
		vpCmd tea.Cmd
	)
	m.textarea, tiCmd = m.textarea.Update(msg)
	m.viewport, vpCmd = m.viewport.Update(msg)
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.state = 1
		m.width, m.height = msg.Width, msg.Height
	case tea.KeyMsg:
		switch msg.Type {
		case tea.KeyCtrlC, tea.KeyEsc:
			fmt.Println(m.textarea.Value())
			return m, tea.Quit
		case tea.KeyEnter:
			m.messages = append(m.messages, "You: "+m.textarea.Value())
			m.viewport.SetContent(strings.Join(m.messages, "\n"))
			m.textarea.Reset()
			m.viewport.GotoBottom()
		}
	}
	return m, tea.Batch(tiCmd, vpCmd)
}

// var style = lipgloss.NewStyle().
// 	Bold(true).
// 	Width(22)

func (m model) View() string {
	// return lipgloss.JoinVertical(lipgloss.Top, style.Render(m.viewport.View()), m.textarea.View())
	if m.state == 0 {
		return "Initializing..."
	}
	return fmt.Sprintf("%dx%d\n%s\n%s",
		m.width, m.height,
		m.viewport.View(),
		m.textarea.View(),
	)
}
