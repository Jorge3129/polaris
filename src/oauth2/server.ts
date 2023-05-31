import { createServer } from "http"
import stoppable from "stoppable"

export function startServer() {
  const server = stoppable(createServer())

  server.on("request", (_, res) => {
    res.end(JSON.stringify({ message: "Hello, Vlad!" }))
    server.stop()
  })

  const port = 3000
  server.listen(port, () => {
    console.log(`Server running on port ${port}`)
  })

  console.log("foo bar")
}

export interface GoogleAuthConfig {
  clientId: string
  redirectUri: string
}

export function getGoogleOAuth2URL({
  clientId,
  redirectUri,
}: GoogleAuthConfig) {
  const params = [
    `client_id=${clientId}`,
    `redirect_uri=${redirectUri}`,
    "response_type=code",
    "access_type=offline&prompt=consent",
    "scope=https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar",
  ]

  return "https://accounts.google.com/o/oauth2/auth?" + params.join("&")
}
