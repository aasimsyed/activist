// SPDX-License-Identifier: AGPL-3.0-or-later
import { fireEvent, screen } from "@testing-library/vue";
import { describe, expect, it } from "vitest";

import FormSelectorRadio from "../../../../app/components/form/selector/FormSelectorRadio.vue";
import render from "../../../render";

const options = [
  {
    value: "1",
    key: "one",
    content: "One",
    aria_label: "test.option.one",
  },
  {
    value: "7",
    key: "seven",
    content: "Seven",
    aria_label: "test.option.seven",
  },
];

// MARK: - Core Functionality
describe("FormSelectorRadio - Core Functionality", () => {
  it("emits new value when selecting an option", async () => {
    const { emitted } = await render(FormSelectorRadio, {
      props: {
        modelValue: undefined,
        options,
      },
    });

    const radios = screen.getAllByRole("radio");
    await fireEvent.click(radios[1]);

    expect(emitted()["update:modelValue"]).toBeTruthy();
    expect(emitted()["update:modelValue"]?.[0]).toEqual(["7"]);
  });

  it("emits value when switching between options", async () => {
    const { emitted } = await render(FormSelectorRadio, {
      props: {
        modelValue: "1",
        options,
      },
    });

    const radios = screen.getAllByRole("radio");
    await fireEvent.click(radios[1]);

    expect(emitted()["update:modelValue"]).toBeTruthy();
    expect(emitted()["update:modelValue"]?.[0]).toEqual(["7"]);
  });

  it("emits undefined when clicking the currently selected option", async () => {
    const { emitted } = await render(FormSelectorRadio, {
      props: {
        modelValue: "1",
        options,
      },
    });

    const radios = screen.getAllByRole("radio");
    await fireEvent.click(radios[0]);

    expect(emitted()["update:modelValue"]).toBeTruthy();
    expect(emitted()["update:modelValue"]?.[0]).toEqual([undefined]);
  });
});

// MARK: - Rendering & Props
describe("FormSelectorRadio - Rendering & Props", () => {
  it("renders correct number of buttons based on options prop", async () => {
    await render(FormSelectorRadio, {
      props: {
        modelValue: undefined,
        options,
      },
    });

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(2);
  });

  it("renders single option correctly", async () => {
    const singleOption = [
      {
        value: "only",
        key: "only",
        content: "Only Option",
        aria_label: "test.only",
      },
    ];

    await render(FormSelectorRadio, {
      props: {
        modelValue: undefined,
        options: singleOption,
      },
    });

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(1);
  });

  it("renders empty state when no options provided", async () => {
    await render(FormSelectorRadio, {
      props: {
        modelValue: undefined,
        options: [],
      },
    });

    const radios = screen.queryAllByRole("radio");
    expect(radios).toHaveLength(0);
  });

  it("applies correct aria-checked states", async () => {
    await render(FormSelectorRadio, {
      props: {
        modelValue: "1",
        options,
      },
    });

    const radios = screen.getAllByRole("radio");
    expect(radios[0].getAttribute("aria-checked")).toBe("true");
    expect(radios[1].getAttribute("aria-checked")).toBe("false");
  });
});

// MARK: - Icon vs Text Content
describe("FormSelectorRadio - Icon vs Text Content", () => {
  it("renders icon when option.isIcon is true", async () => {
    const iconOptions = [
      {
        value: "icon1",
        key: "icon1",
        content: "i-heroicons-home",
        aria_label: "test.icon.home",
        isIcon: true,
      },
    ];

    await render(FormSelectorRadio, {
      props: {
        modelValue: undefined,
        options: iconOptions,
      },
    });

    // Verify the radio button renders (icon rendering is handled by Icon component)
    const radio = screen.getByRole("radio");
    expect(radio).toBeTruthy();
    // Verify text content is NOT rendered when isIcon is true
    expect(screen.queryByText("i-heroicons-home")).toBeNull();
  });

  it("renders text content when option.isIcon is false", async () => {
    await render(FormSelectorRadio, {
      props: {
        modelValue: undefined,
        options,
      },
    });

    expect(screen.getByText("One")).toBeTruthy();
    expect(screen.getByText("Seven")).toBeTruthy();
  });

  it("renders text content when option.isIcon is undefined", async () => {
    const textOptions = [
      {
        value: "text",
        key: "text",
        content: "Text Option",
        aria_label: "test.text",
      },
    ];

    await render(FormSelectorRadio, {
      props: {
        modelValue: undefined,
        options: textOptions,
      },
    });

    expect(screen.getByText("Text Option")).toBeTruthy();
  });
});

// MARK: - CSS Classes
describe("FormSelectorRadio - CSS Classes", () => {
  it("applies style-menu-option-cta to checked option", async () => {
    await render(FormSelectorRadio, {
      props: {
        modelValue: "1",
        options,
      },
    });

    const radios = screen.getAllByRole("radio");
    expect(radios[0].className).toContain("style-menu-option-cta");
  });

  it("applies style-menu-option and bg-layer-2 to unchecked options", async () => {
    await render(FormSelectorRadio, {
      props: {
        modelValue: "1",
        options,
      },
    });

    const radios = screen.getAllByRole("radio");
    expect(radios[1].className).toContain("style-menu-option");
    expect(radios[1].className).toContain("bg-layer-2");
  });

  it("applies rounded-l-lg to first option", async () => {
    await render(FormSelectorRadio, {
      props: {
        modelValue: undefined,
        options,
      },
    });

    const radios = screen.getAllByRole("radio");
    expect(radios[0].className).toContain("rounded-l-lg");
  });

  it("applies rounded-r-lg to last option", async () => {
    await render(FormSelectorRadio, {
      props: {
        modelValue: undefined,
        options,
      },
    });

    const radios = screen.getAllByRole("radio");
    expect(radios[1].className).toContain("rounded-r-lg");
  });

  it("applies custom option.class", async () => {
    const customOptions = [
      {
        value: "custom",
        key: "custom",
        content: "Custom",
        aria_label: "test.custom",
        class: "custom-class",
      },
    ];

    await render(FormSelectorRadio, {
      props: {
        modelValue: undefined,
        options: customOptions,
      },
    });

    const radio = screen.getByRole("radio");
    expect(radio.className).toContain("custom-class");
  });

  it("applies option.checkedClass when option is checked", async () => {
    const checkedClassOptions = [
      {
        value: "checked",
        key: "checked",
        content: "Checked",
        aria_label: "test.checked",
        checkedClass: "checked-custom-class",
      },
    ];

    await render(FormSelectorRadio, {
      props: {
        modelValue: "checked",
        options: checkedClassOptions,
      },
    });

    const radio = screen.getByRole("radio");
    expect(radio.className).toContain("checked-custom-class");
  });

  it("does not apply option.checkedClass when option is not checked", async () => {
    const checkedClassOptions = [
      {
        value: "unchecked",
        key: "unchecked",
        content: "Unchecked",
        aria_label: "test.unchecked",
        checkedClass: "checked-custom-class",
      },
    ];

    await render(FormSelectorRadio, {
      props: {
        modelValue: "different",
        options: checkedClassOptions,
      },
    });

    const radio = screen.getByRole("radio");
    expect(radio.className).not.toContain("checked-custom-class");
  });
});

// MARK: - Edge Cases
describe("FormSelectorRadio - Edge Cases", () => {
  it("handles number values", async () => {
    const numberOptions = [
      {
        value: 1,
        key: "num1",
        content: "Number One",
        aria_label: "test.num.one",
      },
      {
        value: 2,
        key: "num2",
        content: "Number Two",
        aria_label: "test.num.two",
      },
    ];

    const { emitted } = await render(FormSelectorRadio, {
      props: {
        modelValue: undefined,
        options: numberOptions,
      },
    });

    const radios = screen.getAllByRole("radio");
    await fireEvent.click(radios[0]);

    expect(emitted()["update:modelValue"]?.[0]).toEqual([1]);
  });

  it("handles boolean values", async () => {
    const booleanOptions = [
      {
        value: true,
        key: "true",
        content: "True",
        aria_label: "test.bool.true",
      },
      {
        value: false,
        key: "false",
        content: "False",
        aria_label: "test.bool.false",
      },
    ];

    const { emitted } = await render(FormSelectorRadio, {
      props: {
        modelValue: undefined,
        options: booleanOptions,
      },
    });

    const radios = screen.getAllByRole("radio");
    await fireEvent.click(radios[0]);

    expect(emitted()["update:modelValue"]?.[0]).toEqual([true]);
  });

  it("handles object values", async () => {
    const objectValue = { id: 1, name: "test" };
    const objectOptions = [
      {
        value: objectValue,
        key: "obj",
        content: "Object",
        aria_label: "test.obj",
      },
    ];

    const { emitted } = await render(FormSelectorRadio, {
      props: {
        modelValue: undefined,
        options: objectOptions,
      },
    });

    const radio = screen.getByRole("radio");
    await fireEvent.click(radio);

    expect(emitted()["update:modelValue"]?.[0]).toEqual([objectValue]);
  });

  it("handles undefined as an option value", async () => {
    const undefinedOptions = [
      {
        value: undefined,
        key: "undef",
        content: "Undefined",
        aria_label: "test.undef",
      },
      {
        value: "defined",
        key: "defined",
        content: "Defined",
        aria_label: "test.defined",
      },
    ];

    const { emitted } = await render(FormSelectorRadio, {
      props: {
        modelValue: "defined",
        options: undefinedOptions,
      },
    });

    const radios = screen.getAllByRole("radio");
    await fireEvent.click(radios[0]);

    expect(emitted()["update:modelValue"]?.[0]).toEqual([undefined]);
  });

  it("handles selecting undefined option when it is already selected", async () => {
    const undefinedOptions = [
      {
        value: undefined,
        key: "undef",
        content: "Undefined",
        aria_label: "test.undef",
      },
    ];

    const { emitted } = await render(FormSelectorRadio, {
      props: {
        modelValue: undefined,
        options: undefinedOptions,
      },
    });

    const radio = screen.getByRole("radio");
    await fireEvent.click(radio);

    expect(emitted()["update:modelValue"]?.[0]).toEqual([undefined]);
  });
});

// MARK: - Accessibility
describe("FormSelectorRadio - Accessibility", () => {
  it("group has correct role='radiogroup'", async () => {
    const { container } = await render(FormSelectorRadio, {
      props: {
        modelValue: undefined,
        options,
      },
    });

    const group = container.querySelector('[role="radiogroup"]');
    expect(group).toBeTruthy();
  });

  it("buttons have correct role='radio'", async () => {
    await render(FormSelectorRadio, {
      props: {
        modelValue: undefined,
        options,
      },
    });

    const radios = screen.getAllByRole("radio");
    radios.forEach((radio) => {
      expect(radio.getAttribute("role")).toBe("radio");
    });
  });

  it("buttons have correct type='button'", async () => {
    await render(FormSelectorRadio, {
      props: {
        modelValue: undefined,
        options,
      },
    });

    const radios = screen.getAllByRole("radio");
    radios.forEach((radio) => {
      expect(radio.getAttribute("type")).toBe("button");
    });
  });

  it("group has aria-label from i18n", async () => {
    const { container } = await render(FormSelectorRadio, {
      props: {
        modelValue: undefined,
        options,
      },
    });

    const group = container.querySelector('[role="radiogroup"]');
    expect(group?.getAttribute("aria-label")).toBeTruthy();
  });

  it("buttons have aria-label from options", async () => {
    await render(FormSelectorRadio, {
      props: {
        modelValue: undefined,
        options,
      },
    });

    const radios = screen.getAllByRole("radio");
    radios.forEach((radio) => {
      expect(radio.getAttribute("aria-label")).toBeTruthy();
    });
  });
});
