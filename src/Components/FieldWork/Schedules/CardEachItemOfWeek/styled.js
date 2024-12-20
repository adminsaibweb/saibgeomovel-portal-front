import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid #8e44ad;
  border-radius: 5px;
  cursor: pointer;
  /* width: 100%; */
  /* height: 100px; */
  margin: 5px 3px;

  div.contentCounterAgruped {
    padding: 2px 3px;

    background: ${(props) => props.clicked && '#eee'};
    color: ${(props) => props.clicked && '#000 !important'};

    li {
      p {
        color: ${(props) => props.clicked && '#000 !important'};
      }
    }
  }
`;

export const Header = styled.div`
  background: #bf1f7c;
  color: #fff;
  height: max-content;
  width: 100%;

  p {
    padding: 2px 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
