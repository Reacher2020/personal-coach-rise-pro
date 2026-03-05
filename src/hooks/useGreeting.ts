export const useGreeting = () => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Dzień dobry";
    if (hour < 18) return "Cześć";
    return "Dobry wieczór";
  };

  return { getGreeting };
};
