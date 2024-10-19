// ** React
import { ReactNode } from 'react'
// ** Next
import Head from 'next/head'
import { Router } from 'next/router'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
// ** Store
import { Provider } from 'react-redux'
// ** Loader
import NProgress from 'nprogress'
// ** Config
import 'src/configs/i18n'
import { defaultACLObj } from 'src/configs/acl'
import themeConfig from 'src/configs/themeConfig'
// ** Third Party
import { Toaster } from 'react-hot-toast'
// ** Contexts
import { AuthProvider } from 'src/contexts/AuthContext'
import { SettingsConsumer, SettingsProvider } from 'src/contexts/SettingsContext'
// ** Global css styles
import 'src/styles/globals.scss'
import 'react-multi-carousel/lib/styles.css'
// ** Redux
import { store } from 'src/stores'
// ** Components
import GuestGuard from 'src/components/auth/GuestGuard'
import AuthGuard from 'src/components/auth/AuthGuard'
import AclGuard from 'src/components/auth/AclGuard'
import FallbackSpinner from 'src/components/fall-back'
import ReactHotToast from 'src/components/react-hot-toast'
import ThemeComponent from 'src/theme/ThemeComponent'
import NoGuard from 'src/components/auth/NoGuard'
import UserLayout from 'src/views/layouts/UserLayout'
// ** Hook
import { useSettings } from 'src/hooks/useSettings'
// ** Axios
import { AxiosInterceptor } from 'src/helpers/axios'
// ** MUI
import { useTheme } from '@mui/material'

type ExtendedAppProps = AppProps & {
  Component: NextPage
}

type GuardProps = {
  authGuard: boolean
  guestGuard: boolean
  children: ReactNode
}

// ** Pace Loader
if (themeConfig.routingLoader) {
  Router.events.on('routeChangeStart', () => {
    NProgress.start()
  })
  Router.events.on('routeChangeError', () => {
    NProgress.done()
  })
  Router.events.on('routeChangeComplete', () => {
    NProgress.done()
  })
}

const Guard = ({ children, authGuard, guestGuard }: GuardProps) => {
  if (guestGuard) {
    return <GuestGuard fallback={<FallbackSpinner />}>{children}</GuestGuard>
  } else if (!guestGuard && !authGuard) {
    return <NoGuard fallback={<FallbackSpinner />}>{children}</NoGuard>
  } else {
    return <AuthGuard fallback={<FallbackSpinner />}>{children}</AuthGuard>
  }
}

export default function App(props: ExtendedAppProps) {
  const {
    Component,
    pageProps: { session, ...pageProps }
  } = props

  const { settings } = useSettings()
  const theme = useTheme()

  // Variables
  const getLayout = Component.getLayout ?? (page => <UserLayout>{page}</UserLayout>)
  const setConfig = Component.setConfig ?? undefined
  const authGuard = Component.authGuard ?? true
  const guestGuard = Component.guestGuard ?? false
  const aclAbilities = Component.acl ?? defaultACLObj
  const permission = Component.permission ?? []

  const toastOptions = {
    success: {
      className: 'react-hot-toast',
      style: {
        background: '#DDF6E8',
        color: theme.palette.text.primary
      }
    },
    error: {
      className: 'react-hot-toast',
      style: {
        background: '#FDE4D5',
        color: theme.palette.text.primary
      }
    }
  }

  return (
    <Provider store={store}>
      <Head>
        <title>{`${themeConfig.templateName} - Material Design React Admin Template`}</title>
        <meta
          name='description'
          content={`${themeConfig.templateName} – Material Design React Admin Dashboard Template – is the most developer friendly & highly customizable Admin Dashboard Template based on MUI v5.`}
        />
        <meta name='keywords' content='Material Design, MUI, Admin Template, React Admin Template' />
        <meta name='viewport' content='initial-scale=1, width=device-width' />
      </Head>

      <AuthProvider>
        <AxiosInterceptor>
          <SessionProvider session={session}>
            <SettingsProvider {...(setConfig ? { pageSettings: setConfig() } : {})}>
              <SettingsConsumer>
                {({ settings }) => {
                  return (
                    <ThemeComponent settings={settings}>
                      <Guard authGuard={authGuard} guestGuard={guestGuard}>
                        <AclGuard
                          permission={permission}
                          aclAbilities={aclAbilities}
                          guestGuard={guestGuard}
                          authGuard={authGuard}
                        >
                          {getLayout(<Component {...pageProps} />)}
                        </AclGuard>
                      </Guard>
                      <ReactHotToast>
                        <Toaster position={settings.toastPosition} toastOptions={toastOptions} />
                      </ReactHotToast>
                    </ThemeComponent>
                  )
                }}
              </SettingsConsumer>
            </SettingsProvider>
          </SessionProvider>
        </AxiosInterceptor>
      </AuthProvider>
    </Provider>
  )
}
