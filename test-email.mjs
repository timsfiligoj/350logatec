import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const { data, error } = await resend.emails.send({
  from: '350logatec <noreply@350logatec.si>',
  to: ['tim@350life.com'],  // Spremeni v svoj email
  subject: 'Test - 350logatec email',
  html: '<p>Email pošiljanje deluje! 🎉</p>',
})

if (error) {
  console.error('Napaka:', error)
} else {
  console.log('Poslano!', data)
}
