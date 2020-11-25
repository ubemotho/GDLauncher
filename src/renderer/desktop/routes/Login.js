import React, { useState, useEffect, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Transition } from 'react-transition-group';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faExclamationCircle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { Input, Button } from 'antd';
import { useKey } from 'rooks';
import axios from 'axios';
import backgroundVideo from 'src/common/assets/background.webm';
import { load, requesting } from 'src/renderer/common/reducers/loading/actions';
import HorizontalLogo from 'src/renderer/common/components/HorizontalLogo';
import EV from 'src/common/messageEvents';
import features from 'src/renderer/common/reducers/loading/features';
import sendMessage from 'src/renderer/desktop/helpers/sendMessage';
import { openModal } from 'src/renderer/common/reducers/modals/actions';
import { login } from 'src/renderer/common/reducers/authActions';

const LoginButton = styled(Button)`
  border-radius: 4px;
  font-size: 22px;
  background: ${props =>
    props.active ? props.theme.palette.grey[600] : 'transparent'};
  border: 0;
  height: auto;
  margin-top: 40px;
  text-align: center;
  color: ${props => props.theme.palette.text.primary};
  &:hover {
    color: ${props => props.theme.palette.text.primary};
    background: ${props => props.theme.palette.grey[600]};
  }
  &:focus {
    color: ${props => props.theme.palette.text.primary};
    background: ${props => props.theme.palette.grey[600]};
  }
`;

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
`;

const LeftSide = styled.div`
  position: relative;
  width: 300px;
  padding: 40px;
  height: 100%;
  transition: 0.3s ease-in-out;
  transform: translateX(
    ${({ transitionState }) =>
      transitionState === 'entering' || transitionState === 'entered'
        ? -300
        : 0}px
  );
  background: ${props => props.theme.palette.secondary.main};
  & div {
    margin: 10px 0;
  }
  p {
    margin-top: 1em;
    color: ${props => props.theme.palette.text.third};
  }
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  margin: 40px 0 !important;
`;

const Background = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  video {
    transition: 0.3s ease-in-out;
    transform: translateX(
      ${({ transitionState }) =>
        transitionState === 'entering' || transitionState === 'entered'
          ? -300
          : 0}px
    );
    position: absolute;
    z-index: -1;
    height: 150%;
    top: -30%;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
`;

const Footer = styled.div`
  position: absolute;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: calc(100% - 80px);
`;

const Status = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${props => props.theme.palette.text.third};
`;

const FooterLinks = styled.div`
  font-size: 0.75rem;
  margin: 0 !important;
  a {
    color: ${props => props.theme.palette.text.third};
  }
  a:hover {
    color: ${props => props.theme.palette.text.secondary};
  }
`;

const Loading = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  z-index: -1;
  justify-content: center;
  backdrop-filter: blur(8px) brightness(60%);
  font-size: 40px;
  transition: 0.3s ease-in-out;
  opacity: ${({ transitionState }) =>
    transitionState === 'entering' || transitionState === 'entered' ? 1 : 0};
`;
const LoginFailMessage = styled.div`
  color: ${props => props.theme.palette.colors.red};
`;

const StatusIcon = ({ color }) => {
  return (
    <FontAwesomeIcon
      icon={color === 'red' ? faExclamationCircle : faCheckCircle}
      color={color}
      css={`
        margin: 0 5px;
        color: ${props =>
          props.color === 'green'
            ? props.theme.palette.colors.green
            : props.theme.palette.error.main};
      `}
    />
  );
};

const Login = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [version, setVersion] = useState(null);
  const [loginFailed, setLoginFailed] = useState(false);
  const [status, setStatus] = useState({});
  const loading = useSelector(
    state => state.loading[features.checkingAccount].isRequesting
  );

  const authenticate = () => {
    if (!email || !password) return;
    dispatch(requesting(features.checkingAccount));
    setTimeout(() => {
      dispatch(
        load(features.checkingAccount, dispatch(login(email, password, true)))
      ).catch(e => {
        console.error(e);
        setLoginFailed(e);
        setPassword(null);
      });
    }, 1000);
  };

  const fetchStatus = async () => {
    const { data } = await axios.get('https://status.mojang.com/check');
    const result = {};
    Object.assign(result, ...data);
    setStatus(result);
  };

  useKey(['Enter'], authenticate);

  useEffect(() => {
    sendMessage(EV.GET_APP_VERSION).then(setVersion).catch(console.error);
    fetchStatus().catch(console.error);
  }, []);

  return (
    <Transition in={loading} timeout={300}>
      {transitionState => (
        <Container>
          <LeftSide transitionState={transitionState}>
            <Header>
              <HorizontalLogo size={200} />
            </Header>
            <p>Sign in with your Mojang Account</p>
            <Form>
              <div>
                <Input
                  placeholder="Email"
                  value={email}
                  onChange={({ target: { value } }) => setEmail(value)}
                />
              </div>
              <div>
                <Input
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={({ target: { value } }) => setPassword(value)}
                />
              </div>
              {loginFailed && (
                <LoginFailMessage>{loginFailed?.message}</LoginFailMessage>
              )}
              <LoginButton color="primary" onClick={authenticate}>
                Sign In
                <FontAwesomeIcon
                  css={`
                    margin-left: 6px;
                  `}
                  icon={faArrowRight}
                />
              </LoginButton>
            </Form>
            <Footer>
              <div
                css={`
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-end;
                  width: 100%;
                `}
              >
                <FooterLinks>
                  <div>
                    <a href="https://my.minecraft.net/en-us/store/minecraft/#register">
                      CREATE AN ACCOUNT
                    </a>
                  </div>
                  <div>
                    <a href="https://my.minecraft.net/en-us/password/forgot/">
                      FORGOT PASSWORD
                    </a>
                  </div>
                </FooterLinks>
                <div
                  css={`
                    cursor: pointer;
                  `}
                  onClick={() => dispatch(openModal('ChangeLogs'))}
                >
                  v{version}
                </div>
              </div>
              <Status>
                Auth: <StatusIcon color={status['authserver.mojang.com']} />
                Session: <StatusIcon color={status['session.minecraft.net']} />
                Skins: <StatusIcon color={status['textures.minecraft.net']} />
                API: <StatusIcon color={status['api.mojang.com']} />
              </Status>
            </Footer>
          </LeftSide>
          <Background transitionState={transitionState}>
            <video autoPlay muted loop>
              <source src={backgroundVideo} type="video/webm" />
            </video>
          </Background>
          <Loading transitionState={transitionState}>Loading...</Loading>
        </Container>
      )}
    </Transition>
  );
};

export default memo(Login);