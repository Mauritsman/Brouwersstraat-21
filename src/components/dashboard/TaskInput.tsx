import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, Text } from 'react-native';
import { colors, space, radius, text } from '../../theme/theme';

interface TaskInputProps {
  onAdd: (task: string) => void;
}

export function TaskInput({ onAdd }: TaskInputProps) {
  const [value, setValue] = useState('');

  const handleAdd = () => {
    if (value.trim()) {
      onAdd(value.trim());
      setValue('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Voeg taak toe..."
        placeholderTextColor={colors.faint}
        value={value}
        onChangeText={setValue}
        onSubmitEditing={handleAdd}
      />
      <Pressable style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: space.sm,
    backgroundColor: colors.steel,
    borderRadius: radius.sharp,
    padding: space.md,
  },
  input: {
    flex: 1,
    color: colors.bone,
    fontFamily: 'BarlowCondensed_500Medium',
    fontSize: 15,
  },
  button: {
    backgroundColor: colors.ember,
    width: 44,
    height: 44,
    borderRadius: radius.sharp,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.bone,
    fontSize: 24,
    fontWeight: 'bold',
  },
});
