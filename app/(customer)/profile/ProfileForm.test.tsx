import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfileForm } from './ProfileForm'
import type { CustomerProfile } from '@/lib/types/profile'

const baseProfile: CustomerProfile = {
  full_name: 'Maya Cohen',
  phone: '050-1234567',
  bio: 'Looking for a reliable cleaner for my apartment.',
  preferred_service_type: 'residential',
  address: '12 Rothschild Blvd, Tel Aviv',
}

describe('ProfileForm', () => {
  it('renders fields pre-filled with the given profile', () => {
    render(<ProfileForm defaultValues={baseProfile} />)

    expect(screen.getByLabelText<HTMLInputElement>(/full name/i).value).toBe('Maya Cohen')
    expect(screen.getByLabelText<HTMLInputElement>(/phone/i).value).toBe('050-1234567')
    expect(screen.getByLabelText<HTMLTextAreaElement>(/bio/i).value).toBe('Looking for a reliable cleaner for my apartment.')
    expect(screen.getByLabelText<HTMLSelectElement>(/preferred service type/i).value).toBe('residential')
    expect(screen.getByLabelText<HTMLInputElement>(/address/i).value).toBe('12 Rothschild Blvd, Tel Aviv')
  })

  it('calls onSave with the updated profile when submitted', async () => {
    const user = userEvent.setup()
    const onSave = jest.fn()
    render(<ProfileForm defaultValues={baseProfile} onSave={onSave} />)

    const fullName = screen.getByLabelText<HTMLInputElement>(/full name/i)
    await user.clear(fullName)
    await user.type(fullName, 'Maya Levi')

    await user.selectOptions(screen.getByLabelText(/preferred service type/i), 'both')

    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(onSave).toHaveBeenCalledWith({
      ...baseProfile,
      full_name: 'Maya Levi',
      preferred_service_type: 'both',
    })
  })

  it('shows a confirmation message after saving', async () => {
    const user = userEvent.setup()
    render(<ProfileForm defaultValues={baseProfile} />)

    expect(screen.queryByText(/profile updated/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(screen.getByText(/profile updated/i)).toBeInTheDocument()
  })
})
