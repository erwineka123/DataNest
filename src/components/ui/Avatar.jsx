export function Avatar({ src, alt, size = 'md' }) {
  const dimension = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-14 w-14' : 'h-10 w-10'
  return (
    <img
      src={src || 'https://placehold.co/80x80?text=U'}
      alt={alt}
      className={`${dimension} rounded-full object-cover`}
    />
  )
}
