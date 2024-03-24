use crossterm::{
    event::{self, KeyCode, KeyEventKind},
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
    ExecutableCommand,
};
use ratatui::{
    layout::{Constraint, Layout, Rect},
    prelude::{CrosstermBackend, Stylize, Terminal},
    style::{Color, Modifier, Style},
    widgets::{block::Position, Block, BorderType, Borders, Paragraph},
};
use std::io::{stdout, Result};

fn main() -> Result<()> {
    stdout().execute(EnterAlternateScreen)?;
    enable_raw_mode()?;
    let mut terminal = Terminal::new(CrosstermBackend::new(stdout()))?;
    terminal.clear()?;

    loop {
        terminal.draw(|frame| {
            // let hareas = Layout::new(
            //     ratatui::layout::Direction::Horizontal,
            //     vec![Constraint::Percentage(50), Constraint::Percentage(50)],
            // )
            // .split(frame.size());

            // let left_areas = Layout::new(
            //     ratatui::layout::Direction::Vertical,
            //     vec![Constraint::Percentage(50), Constraint::Percentage(50)],
            // )
            // .split(hareas[0]);

            // let right_areas = Layout::new(
            //     ratatui::layout::Direction::Vertical,
            //     vec![Constraint::Percentage(50), Constraint::Percentage(50)],
            // )
            // .split(hareas[1]);

            frame.render_widget(
                Block::default()
                    .title_top("title")
                    .title_alignment(ratatui::layout::Alignment::Center)
                    .borders(Borders::LEFT | Borders::RIGHT)
                    .border_style(Style::default().fg(Color::White))
                    .border_type(BorderType::Rounded)
                    .style(Style::default().bg(Color::Black)),
                frame.size(),
            );
        })?;

        if event::poll(std::time::Duration::from_millis(16))? {
            if let event::Event::Key(key) = event::read()? {
                if key.kind == KeyEventKind::Press && key.code == KeyCode::Char('q') {
                    break;
                }
            }
        }
    }

    stdout().execute(LeaveAlternateScreen)?;
    disable_raw_mode()?;
    Ok(())
}
