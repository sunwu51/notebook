use crossterm::{
    event::{self, KeyCode, KeyEventKind},
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
    ExecutableCommand,
};
use ratatui::{
    layout::{Constraint, Layout, Rect},
    prelude::{CrosstermBackend, Stylize, Terminal},
    style::{Color, Modifier, Style},
    widgets::{
        block::Position, Block, BorderType, Borders, List, ListDirection, ListState, Paragraph,
    },
};
use std::io::{stdout, Result};

fn main() -> Result<()> {
    stdout().execute(EnterAlternateScreen)?;
    enable_raw_mode()?;
    let mut terminal = Terminal::new(CrosstermBackend::new(stdout()))?;
    terminal.clear()?;
    let mut state = ListState::default();
    let items = ["Item 1", "Item 2", "Item 3"];
    state.select(Some(0));
    loop {
        terminal.draw(|frame| {
            let list = List::new(items)
                .block(Block::default().title("List").borders(Borders::ALL))
                .highlight_style(Style::new().add_modifier(Modifier::REVERSED))
                .highlight_symbol(">")
                .repeat_highlight_symbol(true);

            frame.render_stateful_widget(list, Rect::new(0, 0, 40, 40), &mut state);

            // frame.render_widget(
            //     Paragraph::new("Hello Ratatui! (press 'q' to quit)")
            //         .bg(Color::Yellow)
            //         .fg(Color::LightRed)
            //         .block(Block::default().blue().borders(Borders::ALL)),
            //     frame.size(),
            // );
        })?;

        if event::poll(std::time::Duration::from_millis(16))? {
            if let event::Event::Key(key) = event::read()? {
                if key.kind == KeyEventKind::Press && key.code == KeyCode::Char('q') {
                    break;
                }
                if key.kind == KeyEventKind::Press && key.code == KeyCode::Up {
                    match state.selected() {
                        Some(index) => {
                            if index == 0 {
                                state.select(Some(items.len() - 1));
                            } else {
                                state.select(Some(index - 1));
                            }
                        }
                        None => state.select(Some(0)),
                    }
                }
                if key.kind == KeyEventKind::Press && key.code == KeyCode::Down {
                    match state.selected() {
                        Some(index) => {
                            if index == items.len() - 1 {
                                state.select(Some(0));
                            } else {
                                state.select(Some(index + 1));
                            }
                        }
                        None => state.select(Some(0)),
                    }
                }
            }
        }
    }

    stdout().execute(LeaveAlternateScreen)?;
    disable_raw_mode()?;
    Ok(())
}
