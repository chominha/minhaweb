import { ReactNode } from 'react';
import styled from 'styled-components';

interface FrameProps {
  children: ReactNode;
}

export default function Frame({ children }: FrameProps) {
  return (
    <Container>
      {children}
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #ffffff;
`; 