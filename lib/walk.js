const walk = (astNode, {enter, leave}) => {
  visit(astNode, null, enter, leave);
};

const visit = (astNode, parent, enter, leave) => {
  if (enter) {
    enter(astNode, parent);
  }

  const keys = Object.keys(astNode).filter(key =>
    typeof astNode[key] === 'object'
  );

  keys.forEach(key => {
    const value = astNode[key];
    if (Array.isArray(value)) {
      value.forEach(childNode => {
        if (childNode.type) {
          visit(childNode, astNode, enter, leave);
        }
      });
    } else if (value && value.type && typeof value === 'object') {
      visit(value, astNode, enter, leave);
    }
  });

  if (leave) {
    leave(astNode, parent);
  }
};

module.exports = walk;
