import AsciinemaPlayer from '@/app/components/AsciinemaPlayer'
export default function() {
    return <>
    <AsciinemaPlayer src="https://asciinema.org/a/569727.cast" options = {{
        speed: 2,
        theme: 'tango',
        autoplay: true,
      }}/>
    </>
}