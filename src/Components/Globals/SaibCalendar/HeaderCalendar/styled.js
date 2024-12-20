import styled from 'styled-components';

export const Container = styled.div`
  display: flex;

  background: #7e3a9d;
  color: #fff;

  div {
    flex: 1;
    padding: 5px;
    display: flex;
    flex-direction: column;
    align-items: center;
    p {
      text-align: center;
    }
  }
`;

export const ContentNumDay = styled.div`
  border-radius: 50%;
  background: ${(props) => (props.clicked ? '#bf1f7c' : '#fff')};
  color: ${(props) => (props.clicked ? '#fff' : '#000')};
  width: 30px;
  height: 20px;
`;
