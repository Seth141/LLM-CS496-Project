import React from "react";
import styled from "styled-components";
import { TypeAnimation } from 'react-type-animation';

const StyledText = styled.h1`
    font-family: "Monsterrat", sans-serif;
    font-size: 20px;
`;

const ComponentOne = () => {
  return (
    <TypeAnimation
      cursor={false}
      sequence={[" Iris", <br></br>, 3000, " Code faster", 2000, " Plan sprints", 2000, " Build more", 8000, '']}
      repeat={Infinity}
      wrapper="h1"
    />
  );
};

const Header = () => {
  return (
    <header className="bg-dark-background glass sticky top-0 z-[20] mx-auto flex w-full justify-start items-center border-b border-gray-500 p-8">
      <div className="flex-1">
        {/*<ComponentOne />*/}
      </div>
      <StyledText>
        <h3> . </h3>
      </StyledText>
    </header>
  );
};

export default Header;