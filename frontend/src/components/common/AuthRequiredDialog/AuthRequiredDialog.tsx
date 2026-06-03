import { useLocation, useNavigate } from 'react-router-dom'

type AuthRequiredDialogProps = {
  isOpen: boolean
  onClose: () => void
}

function AuthRequiredDialog({ isOpen, onClose }: AuthRequiredDialogProps) {
  const navigate = useNavigate()
  const location = useLocation()

  if (!isOpen) {
    return null
  }

  function handleLoginClick() {
    navigate('/login', {
      state: {
        from: `${location.pathname}${location.search}`,
      },
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111111]/20 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-[#eadfce] bg-[#fffdf8] p-8 text-center shadow-[0_24px_80px_rgba(49,88,59,0.18)]">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#7d7468]">
          Prijava je potrebna
        </p>

        <h3 className="mt-4 font-serif text-2xl font-semibold text-[#344E41]">
          Za to dejanje se moraš prijaviti.
        </h3>

        <p className="mt-4 text-sm leading-6 text-[#6f675f]">
          Po prijavi lahko shranjuješ, všečkaš in označuješ vsebine kot
          dokončane.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleLoginClick}
            className="inline-flex items-center justify-center rounded-full border border-[#31583b] bg-[#31583b] px-5 py-2.5 text-sm font-bold text-[#fffdf8] shadow-[0_12px_28px_rgba(49,88,59,0.22)] transition hover:bg-[#2a4d33]"
          >
            Prijavi se
          </button>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-[#ded2bc] bg-[#fffdf8] px-5 py-2.5 text-sm font-bold text-[#6f675f] transition hover:border-[#cdbfaa] hover:text-[#344E41]"
          >
            Zapri
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthRequiredDialog