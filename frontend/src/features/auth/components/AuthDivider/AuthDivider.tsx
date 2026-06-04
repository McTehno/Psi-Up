type AuthDividerProps = {
  label?: string
}

export default function AuthDivider({ label = 'Ali nadaljujte z' }: AuthDividerProps) {
  return (
    <div className="flex items-center my-7">
      <div className="flex-1 border-t border-[#ded5c6]"></div>
      <span className="px-4 text-[11px] text-[#706b60] uppercase tracking-wider font-medium">
        {label}
      </span>
      <div className="flex-1 border-t border-[#ded5c6]"></div>
    </div>
  )
}


